# TaskBoard — Cloud-Native Task Management

TaskBoard is a full-stack task management application built with React, FastAPI, PostgreSQL, Docker, Kubernetes, Helm, Terraform, Prometheus, and Grafana.

## Features

- Create, view, update, and delete tasks.
- Track task status and priority.
- View task statistics.
- Persist tasks in PostgreSQL.
- Expose health, readiness, and Prometheus metrics endpoints.
- Deploy frontend and backend workloads with Kubernetes.
- Configure backend autoscaling with a Horizontal Pod Autoscaler.
- Monitor application metrics using Prometheus and Grafana.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, Nginx |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Migrations | Alembic |
| Tests | pytest |
| Containers | Docker, Docker Compose |
| Orchestration | Kubernetes, Helm |
| Infrastructure as Code | Terraform, AWS EKS |
| Monitoring | Prometheus, Grafana |
| CI/CD | GitHub Actions |
| Image security | Trivy |
| Container registry | GitHub Container Registry |

## Prerequisites

- Git
- Docker Desktop and Docker Compose
- Python 3.12+
- Node.js 22+
- kubectl, Helm, and Minikube for local Kubernetes deployment
- Terraform and AWS credentials only if deploying AWS infrastructure

## Run Locally

Start the full application:

```bash
docker compose up --build -d
