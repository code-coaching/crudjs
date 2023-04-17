const express = require("express");
const { useCollection } = require("./database");
const { END_POINTS, PROXY_CACHE } = require("../configuration").default;

const router = express.Router();

const handleError = (res, error) => {
  console.error(error);
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
        return handleError(res, error);
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
        return handleError(res, error);
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

const registerProxyCacheRoutes = () => {
  Object.keys(PROXY_CACHE).forEach((key) => {
    const collection = useCollection(key);

    router.get(`/${key}/*`, (req, res) => {
      let originalUrl = req.originalUrl.substring(1, req.originalUrl.length);
      if (originalUrl.endsWith("/")) {
        originalUrl = originalUrl.substring(0, originalUrl.length - 1);
      }
      const swapUrl = `${req.protocol}://${req.get("host")}/${originalUrl}`;

      const url = `${PROXY_CACHE[key].endpoint}/${req.params[0]}`;

      const upsertCacheItem = async (url, exists) => {
        try {
          const response = await fetch(url);
          let json = await response.json();

          if (PROXY_CACHE[key].swapEndpoint) {
            const stringify = JSON.stringify(json);
            const replaced = stringify.replaceAll(
              PROXY_CACHE[key].endpoint,
              swapUrl
            );
            json = JSON.parse(replaced);
          }

          if (exists) {
            collection.updateItemBy("url", url, {
              json,
              invalidationDate: new Date(
                Date.now() + PROXY_CACHE[key].cacheDuration
              ),
            });
          } else {
            collection.createItem({
              url,
              json,
              invalidationDate: new Date(
                Date.now() + PROXY_CACHE[key].cacheDuration
              ),
            });
          }

          return res.json(json).status(200).end();
        } catch (error) {
          return handleError(res, error);
        }
      };

      const isItemInvalid = (item) => item.invalidationDate < new Date();

      collection
        .readItemBy("url", url)
        .then((item) => {
          if (item === null || isItemInvalid(item))
            return upsertCacheItem(url, !!item);

          return res.json(item.json).status(200).end();
        })
        .catch((error) => {
          return handleError(res, error);
        });
    });
  });
};

registerRoutes();
registerProxyCacheRoutes();

module.exports = { routes: router };
