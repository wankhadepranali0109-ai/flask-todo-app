variable "aws_region" {
  type = string
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "image_tag" {
  type = string
}

variable "desired_count" {
  type = number
}

variable "vpc_cidr" {
  type = string
}

variable "public_subnet_1_cidr" {
  type = string
}

variable "public_subnet_2_cidr" {
  type = string
}