const express = require("express");
const bodyParser = require("body-parser");
const { initializeDatabase } = require("./server/database");
const { routes } = require("./server/routes");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(routes);

initializeDatabase().then(() => {
  app.listen(port);
  console.log(`Server listening on port ${port}`);
});
