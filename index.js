const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnnr8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
    try {
        await client.connect();
        // console.log('database connect successfully');
        const database = client.db("craftComfort");
        const productCollection = database.collection("products");
        const ordersCollection = database.collection("orders");

        //GET ALL FURNITURE DATA
        app.get('/furnitures', async (req, res) => {
            const cursor = productCollection.find({});
            const furnitures = await cursor.toArray();
            res.send(furnitures);
        })

        //GET API WITH ID
        app.get('/furnitures/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const furnitures = await productCollection.findOne(query);
            res.json(furnitures);
        })

        //POST ORDER DATA
        app.post('/orders', async (req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.json(result)
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('i am from craft-commfort server');
})

app.listen(port, () => {
    console.log('running server on port', port);
})