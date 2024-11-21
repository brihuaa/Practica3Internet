import { MongoClient } from 'mongodb'

const url = "mongodb+srv://otheruser:123456aaabbbb@cluster0.loyvx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(url);

const dbName = 'Cluster0';

await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const UsersCollection = db.collection('users');

const users = await UsersCollection.find().toArray();

users.forEach((user) => {
  console.log(user);
});