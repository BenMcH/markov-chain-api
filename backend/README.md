# Markov chain sentence generator

This project aims to ingest scripts of various sources and generate sentences based on a particular character's previously spoken word

## Requirements

- NodeJS (10.15.3 used in development)
- Docker-compose

## Startup

First, start the local neo4j instance by running `docker-compose up -d` to start neo4j in the background.

You will need to do a first-time setup of logging into neo4j's dashboard (http://localhost:7474/) to set the root password. In the case of the code here, we simply used the password "password". In practice, it is recommended to have a cryptographically secure password. It would also be advisable to read this value from an environment variable or something like that. (TODO)

Next, in this directory, run `npm install` to fetch the required dependencies and then `npm start` to start the server on port 8252.

## Usage

GET http://localhost:8252/show/:show_name/characters
Returns a list of characters from the show

POST http://localhost:8252/show/:show/character
Body: { "name": "string" }
Creates a character for :show with name `name`

POST http://localhost:8252/show/:show/:name/sentence
Body: { text }
Adds nodes representing the text provided in the context of the graph

TODO:

- Add random walk to GET random sentence
