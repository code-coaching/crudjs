const express = require("express");
const jwt = require("jsonwebtoken");
const { useCollection } = require("./database");
const { END_POINTS, PROXY_CACHE } = require("../configuration");
const GITHUB_KEY = process.env.GITHUB_KEY;
const GITHUB_SECRET = process.env.GITHUB_SECRET;
const GITHUB_SESSION = process.env.GITHUB_SESSION;

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
      try {
        END_POINTS[collectionName].parse(item);
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

    router.get(`/${collectionName}`, (_req, res) => {
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

const createResponse = (data, options = {}) => {
  const response = new Response(JSON.stringify(data), options);
  response.headers.set("content-type", "application/json");
  return response;
};

router.get("/api/auth/github", (req, res) => {
  const scopes = "user,user:email";

  const state = JSON.stringify({
    session: GITHUB_SESSION,
    redirect: req.query.redirect || "/",
  })

  let url = "https://github.com/login/oauth/authorize";
  url = `${url}?client_id=${GITHUB_KEY}`;
  url = `${url}&state=${state}`;
  url = `${url}&scopes=${scopes}`;
  url = `${url}&redirect_uri=${req.protocol}://${req.headers.host}/api/auth/github/callback`;

  res.set("location", url);
  res.status(302).send();
});

const tokenURL = "https://github.com/login/oauth/access_token";
const getAccessToken = async (code) => {
  const r = await fetch(tokenURL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_KEY,
      client_secret: GITHUB_SECRET,
      code,
    }),
  }).then((r) => r.json());
  return r;
};

router.get("/api/auth/github/callback", async (req, res) => {
  const splitUrl = req.url.split("?");
  splitUrl.shift();
  const url = splitUrl.join("?");
  const searchParams = new URLSearchParams(url);

  const code = searchParams.get("code");
  let state = searchParams.get("state");
  if (state) state = JSON.parse(state)

  if (!code)
    return createResponse("", { status: 400, statusText: "BAD_REQUEST" });
  if (code !== GITHUB_KEY && state.session !== GITHUB_SESSION)
    return createResponse("", { status: 400, statusText: "BAD_REQUEST" });

  const accessToken = await getAccessToken(code);

  const userUrl = "https://api.github.com/user";
  const githubUser = await fetch(userUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken.access_token}`,
    },
  }).then((r) => r.json());

  const { id, login } = githubUser;
  const user = {
    githubId: id.toString(),
    github: {
      id: id.toString(),
      username: login,
    },
  };

  const users = useCollection("users");
  let match = await users.readItemBy("githubId", user.githubId);
  if (!match) {
    try {
      result = END_POINTS.users.parse(user);
    } catch (error) {
      return handleError(res, error);
    }
    users.createItem(user);
    match = await users.readItemBy("githubId", user.githubId);
  }
  const token = jwt.sign({ ...match }, GITHUB_SECRET, { expiresIn: "7d" });

  res.set("location", `${state.redirect}/#access_token=${token}`);
  res.status(302).send();
});

registerRoutes();
registerProxyCacheRoutes();

module.exports = { routes: router };
