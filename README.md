# Sight Reader Pro - University of London CS Final Project

Sight Reader Pro is an application that helps musician's grow their [sight-reading](https://simple.wikipedia.org/wiki/Sight-reading) abilities.

## Setup

### Create env file

```bash
cd project/
cp .env.example .env
```

Add huggingface credentials if you would like. If you don't have huggingface, delete the huggingface variable from the `.env` file.

### Docker compose up

This project can be run entirely in [docker](https://www.docker.com/):

```bash
cd project/
docker compose up
```

> [!WARNING]
> This project needs ~8gb of ram to run all of the containers at once. Conisder stopping mlflow if you're concerned with memory.

Assuming no errors, you should be able to go to [http://localhost:5173](http://localhost:5173/) and see Sight Reader Pro
