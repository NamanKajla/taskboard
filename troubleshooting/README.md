# TaskBoard Troubleshooting

## Backend is unhealthy
- Check logs: `docker compose logs backend`
- Verify PostgreSQL: `docker compose ps`
- Check API health: `curl http://localhost:8000/health`
- Check database readiness: `curl http://localhost:8000/ready`

## Frontend cannot reach the API
- Check logs: `docker compose logs frontend`
- Verify the frontend is available at `http://localhost:3000`
- Verify the API is available at `http://localhost:8000/docs`

## Database migration fails
- Check `DATABASE_URL` in the backend environment.
- Check PostgreSQL health with `docker compose ps`.
- Inspect backend startup logs before restarting the stack.

## GitHub Actions fails
- Open the Actions tab in the GitHub repository.
- Inspect the first failing step.
- Fix the underlying test, build, image, or security-scan issue.

## Kubernetes pods are not ready
- Inspect pods: `kubectl get pods -n taskboard`
- Inspect events: `kubectl get events -n taskboard --sort-by=.lastTimestamp`
- Inspect logs: `kubectl logs -n taskboard deployment/taskboard-backend`
