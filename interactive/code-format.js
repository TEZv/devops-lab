/* Pretty line breaks for SQL / Python snippets in fill-blanks & code panels. */
(function initCodeFormat(global) {
  const SQL_KW = [
    'FULL OUTER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
    'GROUP BY', 'ORDER BY', 'PARTITION BY', 'UNION ALL', 'UNION',
    'HAVING', 'WHERE', 'FROM', 'SELECT', 'WITH', 'JOIN',
  ];

  function detectLang(code) {
    const s = String(code || '');
    if (/\b(SELECT|FROM|WHERE|GROUP BY|WITH|CREATE TABLE)\b/i.test(s)) return 'sql';
    if (/\b(def |import |pd\.|df\.|for |return |\.groupby)/i.test(s)) return 'python';
    return 'text';
  }

  function breakBeforeKeywords(s, keywords) {
    let out = s;
    keywords.forEach((kw) => {
      const esc = kw.replace(/ /g, '\\s+');
      const re = new RegExp(`([^\\n])(\\s+)(${esc})\\b`, 'gi');
      out = out.replace(re, '$1\n$3');
    });
    return out;
  }

  function formatSql(s) {
    let out = String(s).replace(/\r\n/g, '\n');
    out = out.replace(/WITH\s+(\w+)\s+AS\s*\(\s*/gi, 'WITH $1 AS (\n  ');
    out = out.replace(/\(\s*(SELECT)\b/gi, '(\n  $1');
    out = breakBeforeKeywords(out, SQL_KW);
    out = out.replace(/\)\s+(SELECT)\b/gi, ')\n$1');
    out = out.replace(/(FROM\s+\S+)\s+(WHERE)\b/gi, '$1\n$2');
    out = out.replace(/(GROUP BY\s+[^;\n]+)\s+(HAVING)\b/gi, '$1\n$2');
    out = out.replace(/(GROUP BY\s+[^;\n]+)\s+(____)/g, '$1\n$2');
    out = out.replace(/(FROM\s+\S+)\s+(____)/g, '$1\n$2');
    out = out.replace(/\s+(WHERE)\s+(rn\s*=)/gi, '\n$1 $2');
    out = out.replace(/(RankedData|Ranked|r)\s+(WHERE)\b/gi, '$1\n$2');
    out = out.replace(/OVER\s*\(\s*(PARTITION BY)/gi, 'OVER (\n    $1');
    out = out.replace(/(PARTITION BY[^;\n]+)\s+(ORDER BY)\b/gi, '$1\n    $2');
    out = out.replace(/\)\s+AS\b/gi, '\n  ) AS');
    return out.replace(/\n{3,}/g, '\n\n').trimEnd();
  }

  function formatPython(s) {
    let out = String(s).replace(/\r\n/g, '\n');
    if (!out.includes('\n') && /\.____/.test(out)) {
      out = out.replace(/(\S)\s*(\.____)/g, '$1\n    $2');
    }
    out = out.replace(/(\))\s*(\.)/g, '$1\n    $2');
    out = out.replace(/(____\([^)]*\))\s*(\.)/g, '$1\n    $2');
    return out.trimEnd();
  }

  function formatForDisplay(code, lang) {
    if (code == null || code === '') return '';
    const l = lang || detectLang(code);
    if (l === 'sql') return formatSql(code);
    if (l === 'python') return formatPython(code);
    return String(code).replace(/\r\n/g, '\n');
  }

  global.DeLabCodeFormat = { formatForDisplay, detectLang };
})(typeof window !== 'undefined' ? window : globalThis);
