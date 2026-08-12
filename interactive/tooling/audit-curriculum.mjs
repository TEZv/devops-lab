import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolingDir = path.dirname(fileURLToPath(import.meta.url));
const blocksDir = path.resolve(toolingDir, '..', 'blocks');
const files = fs.readdirSync(blocksDir)
  .filter((name) => name.endsWith('.json') && !name.endsWith('.en.json'))
  .sort();

const forbidden = /Gismart|Headway|SKELAR|AirSlate|Jooble|Genesis/i;
const appliedTypes = new Set([
  'scenario', 'whats_wrong', 'csv_lab', 'pipeline_build', 'pick_rows',
  'fog_probe', 'aim_range', 'fill_blanks', 'drag_order',
]);

const errors = [];
const warnings = [];
let levelCount = 0;
const blockIds = new Set();

for (const file of files) {
  const filePath = path.join(blocksDir, file);
  let block;
  try {
    block = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
    continue;
  }

  if (!block.id || !block.title || !Array.isArray(block.levels)) {
    errors.push(`${file}: expected id, title, and levels[]`);
    continue;
  }
  if (blockIds.has(block.id)) errors.push(`${file}: duplicate block id ${block.id}`);
  blockIds.add(block.id);

  const serialized = JSON.stringify(block);
  const fingerprint = serialized.match(forbidden);
  if (fingerprint) errors.push(`${file}: employer fingerprint "${fingerprint[0]}"`);

  const levelIds = new Set();
  for (const level of block.levels) {
    levelCount += 1;
    if (!level.id || !level.type || !level.title) {
      errors.push(`${file}: every level needs id, type, and title`);
      continue;
    }
    if (levelIds.has(level.id)) errors.push(`${file}: duplicate level id ${level.id}`);
    levelIds.add(level.id);
  }

  if (block.levels.length < 4) warnings.push(`${file}: fewer than four learning moves`);
  if (!block.levels.some((level) => appliedTypes.has(level.type))) {
    warnings.push(`${file}: no applied/failure-oriented level`);
  }

  const enPath = filePath.replace(/\.json$/, '.en.json');
  if (fs.existsSync(enPath)) {
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const uaIds = block.levels.map((level) => level.id).join('|');
    const enIds = (en.levels || []).map((level) => level.id).join('|');
    if (uaIds !== enIds) errors.push(`${file}: UA/EN level ids are out of sync`);
  }
}

console.log(`Curriculum audit: ${files.length} blocks, ${levelCount} levels`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exit(1);
console.log(`PASS with ${warnings.length} warning(s)`);
