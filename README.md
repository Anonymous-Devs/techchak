# cloud-reality-backend



## Getting started

## Running this App on Docker Locally
** Make sure you have Docker installed on your machine
** Make sure you have the environment variables in .env

- [] Start Docker on your local machine (You can open the app on your computer and make sure it started)
- [] Build the image in a docker compose fashion with the belows command

```
docker image build . -t techchak
docker run -p 4000:4000 techchak
```

# Kill a running container
- List the container and grab its ID
```
docker container ls 
```
- Kill it
```
docker kill containerid
```