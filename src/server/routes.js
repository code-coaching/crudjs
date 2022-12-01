const express = require("express");
const { useCollection } = require("./database");
const { END_POINTS } = require("../configuration");

const router = express.Router();

const handleError = (res, error) => {
  res.json(error).status(500).end();
};

const registerRoutes = () => {
  Object.keys(END_POINTS).forEach((collectionName) => {
    const collection = useCollection(collectionName);
    router.post(`/${collectionName}`, (req, res) => {
      const item = req.body;
      let result = {};
      try {
        result = END_POINTS[collectionName].parse(item);
      } catch (error) {
        handleError(res, error);
        return;
      }
      collection
        .createItem(item)
        .then(() => {
          res.json(item).status(201).end();
        })
        .catch((error) => handleError(res, error));
    });

    router.get(`/${collectionName}`, (req, res) => {
      collection
        .readItems()
        .then((items) => res.json({ data: items }).status(200).end())
        .catch((error) => handleError(res, error));
    });

    router.get(`/${collectionName}/:id`, (req, res) => {
      const { id } = req.params;
      collection
        .readItem(id)
        .then((item) => {
          res
            .json({ data: [item] })
            .status(200)
            .end();
        })
        .catch((error) => handleError(res, error));
    });

    router.delete(`/${collectionName}/:id`, (req, res) => {
      const { id } = req.params;
      collection
        .deleteItem(id)
        .then(() => {
          res.status(204).end();
        })
        .catch((error) => handleError(res, error));
    });

    router.put(`/${collectionName}/:id`, (req, res) => {
      const { id } = req.params;
      const item = req.body;

      let result = {};
      try {
        result = END_POINTS[collectionName].parse(item);
      } catch (error) {
        handleError(res, error);
        return;
      }
      collection
        .updateItem(id, result)
        .then(() => {
          res
            .json({ id, ...item })
            .status(200)
            .end();
        })
        .catch((error) => handleError(res, error));
    });
  });
};

registerRoutes();

module.exports = { routes: router };
