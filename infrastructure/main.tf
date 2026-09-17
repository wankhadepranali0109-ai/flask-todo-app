module "todo_app" {
  source = "./modules/todo-app"

  aws_region           = var.aws_region
  project_name         = var.project_name
  environment          = var.environment
  image_tag            = var.image_tag
  desired_count        = var.desired_count
  vpc_cidr             = var.vpc_cidr
  public_subnet_1_cidr = var.public_subnet_1_cidr
  public_subnet_2_cidr = var.public_subnet_2_cidr
}