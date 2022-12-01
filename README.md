# CrudJS

CrudJS is a library to create a server with CRUD end points **in two steps**.

This is intented to be used as an easy to use development server, a production server should be created with a more robust solution.
For 'proof of concept projects' or 'small projects' this could be used in production as well.

## Use locally

Clone this project.

### .env

Copy the contents of the file `.env.example` to a new file called `.env` and change the values.

This project uses MongoDB as a database, this can either be a local database or a cloud based database [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## Development

Execute `npm install` to install the dependencies.

Execute `npm run dev` to start the server.

## How to use

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
