# CRUD JS

CRUD JS is a simple library to create a server with CRUD end points.

This is intented to be used as an easy to use development server, a production server should be created with a more robust solution.
For 'proof of concept projects' or 'small projects' this could be used in production as well.

## Use locally

Clone this project.

### .env

Copy .env.example to .env and change the values.

This project assumes the usage of a MongoDB database, which can be created for free on [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## Development

Execute `npm install` to install the dependencies.

Execute `npm run dev` to start the server.

## How to use

Let's say you want to create a server with a `users` collection.

Validation is done through [Zod](https://github.com/colinhacks/zod).

```js
const { z } = require("zod");

/**
 * Step 1: Create a schema describing how the data should look like.
 */
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

/**
 * Step 2: Add the name to the list of collections.
 */

const COLLECTIONS = {
  USERS: "users",
};

/*
 * Step 3: Couple the schema with the collection name.
 */
const VALIDATIONS = {
  [COLLECTIONS.EXAMPLE]: exampleSchema,
  [COLLECTIONS.SAMPLE]: sampleSchema,
};

module.exports = {
  VALIDATIONS,
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
