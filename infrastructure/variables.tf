variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used as a prefix for resources"
  type        = string
  default     = "flask-todo"
}

variable "image_tag" {
  description = "Docker image tag deployed to ECS later"
  type        = string
  default     = "1.0"
}