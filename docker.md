## Deployment Instructions
To deploy the Bluestone service, follow these steps:

1. Clone the repository:

```shell
git clone https://github.com/1943time/bluestone-service && cd bluestone-service
```

2. Before proceeding, ensure you have Docker installed on your system. You can install Docker using the following command:

```shell
sudo apt update -y ; sudo apt install docker-compose -y
```

3. Add docker-compose.yml if its missing

```
version: "3.9"
services:
  bluestone:
    container_name: bluestone-service
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    ports:
      - "3002:3002"
    restart: always
```

4. Build and run the Docker container using `docker-compose`.

Using the faster docker-compose syntax (older)
```shell
sudo docker-compose up --build
```

OR

Using the latest docker compose syntax
## Exposing Bluestone Service
To expose the Bluestone service, choose one of the following methods:

Nginx Proxy Manager
Nginx
The Bluestone service has been tested and verified to work with various domain exposure methods, including Cloudflare Tunnels, Tailscale Funnel, and Traefik.

