const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const CONNECTION_URL = process.env.MONGO_CONNECTION_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

let database;

const initializeDatabase = async () => {
  const client = await MongoClient.connect(CONNECTION_URL, {
    useNewUrlParser: true,
  });
  database = client.db(DATABASE_NAME);
};

const useCollection = (collectionName) => {
  const db = () => database.collection(collectionName);

  const createItem = (item) => db().insertOne(item);
  const readItems = () => db().find({}).toArray();
  const readItem = (id) => db().findOne({ _id: ObjectId(id) });
  const updateItem = (id, args) =>
    db().updateOne({ _id: ObjectId(id) }, { $set: { ...args } });
  const deleteItem = (id) => db().deleteOne({ _id: ObjectId(id) });

  return {
    createItem,
    readItems,
    updateItem,
    collectionName,
    deleteItem,
    readItem,
  };
};

module.exports = {
  initializeDatabase,
  useCollection,
};
