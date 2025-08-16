# Docker Configuration

This directory contains Docker configuration files for containerizing the Conversation Tracker application.

## Files

- **dockerfile** - Defines the Docker image for the application
- **docker-compose.yml** - Orchestrates the application container and any dependencies

## Container Names

The containers are explicitly named for clarity:
- `conversation-tracker-app` - The Next.js application (port 3001)
- `conversation-tracker-api` - The JSON Server API (port 5051)

## Usage

### Method 1: Using Docker Compose (Recommended)

From the **project root directory**, run:
```bash
docker-compose -f docker/docker-compose.yml up
```

To build and run in one command:
```bash
docker-compose -f docker/docker-compose.yml up --build
```

To run in detached mode (background):
```bash
docker-compose -f docker/docker-compose.yml up -d
```

To stop:
```bash
docker-compose -f docker/docker-compose.yml down
```

To view logs:
```bash
docker-compose -f docker/docker-compose.yml logs -f
```

To rebuild after code changes:
```bash
docker-compose -f docker/docker-compose.yml build --no-cache
docker-compose -f docker/docker-compose.yml up
```

### Method 2: Building Docker Image Manually

From the **project root directory**:
```bash
docker build -f docker/dockerfile -t conversation-tracker .
```

Then run:
```bash
docker run -p 3001:3000 conversation-tracker
```

## Ports

- **Application**: http://localhost:3001
- **API Server**: http://localhost:5051

## Important Notes

- **Always run commands from the project root directory**, not from the docker/ directory
- The `build.context: ..` in docker-compose.yml ensures the build context is the project root
- The `.dockerignore` file remains in the project root as Docker expects it there
- Database is stored in `data/db.json` (relative to project root)
- Environment variables should be configured via `.env` file in the project root
- Container names are explicitly set to avoid generic "docker-" prefixes

## File Paths

The docker-compose.yml uses these paths:
- Build context: `..` (parent directory/project root)
- Dockerfile: `docker/dockerfile` (relative to build context)
- Database: `../data/db.json` (relative to docker-compose.yml location)
- Routes: `../routes.json` (relative to docker-compose.yml location)