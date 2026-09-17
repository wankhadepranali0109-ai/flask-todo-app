resource "aws_cloudwatch_log_group" "app" {
  name              ="/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Name    = "${var.project_name}-${var.environment}-logs"
    Project = var.project_name
    Environment = var.environment
  }
}

resource "aws_ecs_cluster" "app" {
  name = "${var.project_name}-${var.environment}-cluster"

  tags = {
    Name    = "${var.project_name}-${var.environment}-cluster"
    Project = var.project_name
    Environment = var.environment
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-${var.environment}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "flask-todo-container"
      image     = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "${var.project_name}-${var.environment}"
        }
      }
    }
  ])

  tags = {
    Name    ="${var.project_name}-${var.environment}-task"
    Project = var.project_name
    Environment = var.environment
  }
}

resource "aws_ecs_service" "app" {
  name            = "${var.project_name}-${var.environment}-service"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  launch_type     = "FARGATE"
  desired_count = var.desired_count

  network_configuration {
    subnets = [
      aws_subnet.public_1.id,
      aws_subnet.public_2.id
    ]

    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "flask-todo-container"
    container_port   = 8000
  }

  depends_on = [
    aws_lb_listener.http
  ]

  tags = {
    Name    ="${var.project_name}-${var.environment}-service"
    Project = var.project_name
    Environment = var.environment
  }
}