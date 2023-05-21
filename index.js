const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//mongodb code start

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1oh7p7d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toyDB").collection("toys");

    const indexKeys = { name: 1 };
    const indexOptions = { name: "toyName" };

    const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/toySearchByName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $or: [{ name: { $regex: text, $options: "i" } }],
        })
        .toArray();

      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const cursor = toyCollection.find().limit(20); // this is the limit method, for this all toys page show only 20 data by default, by removing .limit(20) it will show all toys added
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:subCategory", async (req, res) => {
      const category = req.params.subCategory;
      const query = { subCategory: category };
      const cursor = toyCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/mytoys/:email", async (req, res) => {
      const email = req.params.email;
      const query = { sellerEmail: email };
      const sortBy = req.query.sort === "1" ? 1 : -1; // 1 for ascending, -1 for descending

      const pipeline = [
        { $match: query },
        { $addFields: { price: { $toInt: "$price" } } },
        { $sort: { price: sortBy } },
      ];

      const result = await toyCollection.aggregate(pipeline).toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.get("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.put("/updatetoy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          name: updatedToy.name,
          price: updatedToy.price,
          subCategory: updatedToy.subCategory,
          quantity: updatedToy.quantity,
          rating: updatedToy.rating,
          description: updatedToy.description,
          photo: updatedToy.photo,
        },
      };
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//mongodb code end

app.get("/", (req, res) => {
  res.send("Toytopia-Kids Server is Running");
});

app.listen(port, () => {
  console.log(`Toytopia-Kids Server is Running on port: ${port}`);
});
