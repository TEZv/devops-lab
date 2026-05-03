terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  # Авторизація через GITHUB_TOKEN (автоматично в Codespaces)
}

# Створення репозиторію
resource "github_repository" "example" {
  name        = "devops-practice-repo"
  description = "Репозиторій для DevOps практики"
  visibility  = "public"
  auto_init   = true
}

# GitHub Actions secrets
resource "github_actions_secret" "example_secret" {
  repository       = github_repository.example.name
  secret_name      = "EXAMPLE_SECRET"
  plaintext_value  = "practice-value"
}
