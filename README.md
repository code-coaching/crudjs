# CrudJS

CrudJS is a library to create a server with CRUD end points **in two steps**.

This is intented to be used as an easy to use development server, a production server should be created with a more robust solution.
For 'proof of concept projects' or 'small projects' this could be used in production as well.

## Use locally

Clone this project.

### .env

Copy the contents of the file `.env.example` to a new file called `.env` and change the values.

#### Database

This project uses MongoDB as a database, this can either be a local database or a cloud based database [MongoDB Atlas](https://www.mongodb.com/atlas/database).

#### GitHub OAuth

This project has GitHub OAuth implemented, this is used to authenticate users. Create a GitHub OAuth app and fill in the values in the `.env` file.

## Development

Execute `npm install` to install the dependencies.

Execute `npm run dev` to start the server.

## How to use

### CRUD End points

The only file that needs to be changes is `src/configuration.js`.
Validation is done through [Zod](https://github.com/colinhacks/zod).

Let's say you want to create a server with a `users` collection.

```js
const { z } = require("zod");

/**
 * Step 1: Create a schema describing how the data should look like.
 */
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// example of a nested schema
const nestedSchema = z.object({
  users: z.array(userSchema),
});

/*
 * Step 2: Couple the schema with the endpoint.
 */
const END_POINTS = {
  users: userSchema,
  "nested-end-point": nestedSchema,
};

module.exports = {
  END_POINTS,
};
```

That's it! Now you can start the server and use the end points:

- GET /users
- GET /users/:id

  - :id is the `_id` of the MongoDB document.

- POST /users

  - Body: { name: "John Duck", age: 30 }

- PUT /users/:id

  - Body: { name: "John Duck", age: 30 }

- DELETE /users/:id

  - :id is the `_id` of the MongoDB document.

- GET /nested-end-point
- GET /nested-end-point/:id

  - :id is the `_id` of the MongoDB document.

- POST /nested-end-point

  - Body: { users: [{ name: "John Duck", age: 30 }] }

- PUT /nested-end-point/:id

  - Body: { users: [{ name: "John Duck", age: 30 }] }

- DELETE /nested-end-point/:id

  - :id is the `_id` of the MongoDB document.

### Proxy/Caching

To set up a proxy/caching end point, you need to add the end point to the `PROXY_CACHE` object in `src/configuration.js`.
In this example we will use the [PokeAPI](https://pokeapi.co/).

```js
const PROXY_CACHE = {
  pokeapi: {
    endpoint: "https://pokeapi.co/api/v2",
    swapEndpoint: true,
    /**
     * Cache duration in milliseconds
     * milliseconds * seconds * minutes * hours * day
     * uncomment the one you want to use
     */
    cacheDuration: weeks(1), // 1 week
    // cacheDuration: weeks(1) + days(3) + hours(5), //  1 week, 3 days, 5 hours
    // cacheDuration: days(1), // 1 day
    // cacheDuration: hours(1), // 1 hour
    // cacheDuration: minutes(1), // 1 minute
  },
};

module.exports = {
  PROXY_CACHE,
};
```

That's it!

This will create a proxy end point to the PokeAPI, and cache the results for 1 week in the MongoDB database.
