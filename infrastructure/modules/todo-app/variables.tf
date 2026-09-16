variable "aws_region" {
  description = "AWS region for resources and CloudWatch logs"
  type        = string
}

variable "project_name" {
  description = "Base name of the application"
  type        = string
}

variable "environment" {
  description = "Environment name, for example dev or test"
  type        = string
}

variable "image_tag" {
  description = "ECR image tag deployed to ECS"
  type        = string
}

variable "desired_count" {
  description = "Number of ECS tasks to keep running"
  type        = number
  default     = 1
}

variable "vpc_cidr" {
  description = "CIDR range for the environment VPC"
  type        = string
}

variable "public_subnet_1_cidr" {
  description = "CIDR range for first public subnet"
  type        = string
}

variable "public_subnet_2_cidr" {
  description = "CIDR range for second public subnet"
  type        = string
}