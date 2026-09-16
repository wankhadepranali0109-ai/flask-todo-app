output "application_url" {
  description = "Public URL of the Flask To-Do application"
  value       = "http://${module.todo_app.alb_dns_name}"
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.todo_app.alb_dns_name
}

output "ecr_repository_url" {
  description = "ECR repository used by the application"
  value       = module.todo_app.ecr_repository_url
}