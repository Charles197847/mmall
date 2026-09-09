terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Placeholder for Phase 7 infrastructure.
# Provision RDS (Postgres 16), ElastiCache (Redis), OpenSearch, and ECS/EKS here.

variable "environment" {
  type    = string
  default = "dev"
}

output "notes" {
  value = "Shopping Mall IaC stub — replace with real modules before production."
}
