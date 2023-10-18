const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5500;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;


// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.5fpt8zt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("coffeeStore");
        const coffeeCollection = database.collection("coffees");
        const userCollection = database.collection("users");

        app.get("/coffees", async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post("/coffees", async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            // const result = await client.db("smStore").collection("coffees").insertOne(newCoffee);
            const result = await coffeeCollection.insertOne(newCoffee);
            console.log(result);
            res.send(result);
        });

        app.get("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.put("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = req.body;
            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo,
                },
            };
            const result = await coffeeCollection.updateOne(query, coffee, options);
            res.send(result);
        })

        app.delete("/coffees/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        app.get("/users", async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post("/users", async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            const result = await userCollection.insertOne(newUser);
            console.log(result);
            res.send(result);
        });

        app.patch("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const updateUser = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt
                },
            };
            const result = await userCollection.updateOne(query, updateUser);
            res.send(result);
        })

        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})