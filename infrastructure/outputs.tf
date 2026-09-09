output "ecr_repository_url" {
  description = "Private ECR URI for the Flask Docker image"
  value       = aws_ecr_repository.app.repository_url
}