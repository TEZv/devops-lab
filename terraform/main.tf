terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  # Authorization via GITHUB_TOKEN (automatic in Codespaces)
}

# Create a repository
resource "github_repository" "example" {
  name        = "devops-practice-repo"
  description = "A repository for DevOps practice"
  visibility  = "public"
  auto_init   = true
}

# GitHub Actions secrets
resource "github_actions_secret" "example_secret" {
  repository       = github_repository.example.name
  secret_name      = "EXAMPLE_SECRET"
  plaintext_value  = "practice-value"
}
