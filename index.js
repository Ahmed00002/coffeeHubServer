import e from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const port = process.env.server_port || 5000;
const app = e();

//middle ware
app.use(e.json());
app.use(cors());
console.log(process.env.db_user);

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.tvnzs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const coffeeCollection = client.db("AllCoffee").collection("coffeeItems");

    // all apis
    // get all coffee data
    app.get("/allCoffee", async (req, res) => {
      const coffee = coffeeCollection.find();
      const coffees = await coffee.toArray();
      res.send(coffees);
    });
    // add coffee to database
    app.post("/addCoffee", async (req, res) => {
      const coffeeData = req.body;
      const result = await coffeeCollection.insertOne(coffeeData);
      console.log(result);
      res.send(result);
    });
    // delete coffee
    app.delete("/allCoffee/delete/:id", async (req, res) => {
      const id = req.params.id;
      console.log(`delete this id: ${id}`);

      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send({
          message: "Item deleted Successfully",
          isDeleted: true,
          status: 200,
        });
      } else {
        res.send({
          message: "Item didn't deleted successfully ",
          isDeleted: false,
          status: 404,
        });
      }
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

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
