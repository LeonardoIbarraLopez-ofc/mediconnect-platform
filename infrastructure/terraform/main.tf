# Terraform: Infraestructura como Código para MediConnect
# Define los recursos cloud para el despliegue en producción.
# Según FUNCIONAMIENTO.MD: "cada microservicio debe estar contenerizado.
# El despliegue de base de datos se maneja vía infrastructure/docker-compose.yml".
# Este archivo complementa docker-compose con la capa cloud (AWS).
#
# Recursos definidos:
# - ECS Cluster para los microservicios contenerizados
# - RDS PostgreSQL (instancias separadas por servicio)
# - DocumentDB (compatible MongoDB) para EHR
# - InfluxDB Cloud para telemetría IoT
# - MSK (Kafka gestionado) para mensajería
# - S3 Bucket para grabaciones de telemedicina

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Estado remoto en S3 para trabajo en equipo
  backend "s3" {
    bucket = "mediconnect-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "Región AWS para el despliegue"
  default     = "us-east-1"
}

variable "environment" {
  description = "Entorno de despliegue: dev, staging, prod"
  default     = "prod"
}

# ─── ECS Cluster (Microservicios) ────────────────────────────────
resource "aws_ecs_cluster" "mediconnect" {
  name = "mediconnect-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ─── S3 Bucket para Grabaciones de Telemedicina ──────────────────
resource "aws_s3_bucket" "recordings" {
  bucket = "mediconnect-recordings-${var.environment}"
}

resource "aws_s3_bucket_versioning" "recordings" {
  bucket = aws_s3_bucket.recordings.id
  versioning_configuration {
    # Versionado obligatorio para auditoría legal de grabaciones clínicas
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "recordings" {
  bucket = aws_s3_bucket.recordings.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ─── RDS PostgreSQL para Citas ────────────────────────────────────
resource "aws_db_instance" "appointments" {
  identifier        = "mediconnect-appointments-${var.environment}"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.medium"
  allocated_storage = 20
  db_name           = "appointments_db"
  username          = "mediconnect"
  password          = var.db_password
  # Multi-AZ para alta disponibilidad en producción
  multi_az          = var.environment == "prod"
  skip_final_snapshot = var.environment != "prod"
}

variable "db_password" {
  description = "Contraseña de la base de datos (usar AWS Secrets Manager en prod)"
  sensitive   = true
}

# ─── MSK (Kafka Gestionado) ───────────────────────────────────────
resource "aws_msk_cluster" "mediconnect" {
  cluster_name           = "mediconnect-${var.environment}"
  kafka_version          = "3.6.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type  = "kafka.t3.small"
    client_subnets = [] # En producción: referenciar subnets de la VPC
    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
  }
}

output "kafka_bootstrap_brokers" {
  description = "Brokers Kafka para configurar en los microservicios"
  value       = aws_msk_cluster.mediconnect.bootstrap_brokers
}

output "recordings_bucket_name" {
  description = "Nombre del bucket S3 para grabaciones"
  value       = aws_s3_bucket.recordings.bucket
}
