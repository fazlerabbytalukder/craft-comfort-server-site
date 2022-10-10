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
        const usersCollection = database.collection("users");

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

        //GET ORDER DATA BY USER
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //GET ALL USER ORDER DATA
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //UPDATE ORDER DATA
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: "Shipped"
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        //DELETE ORDER DATA
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        //USER INFO POST TO THE DATABASE
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result)
        })

        //GET ALL USER ORDER DATA
        app.get('/allusers', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.json(users);
        });

        //DELETE USER
        app.delete('/allusers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.json(result);
        })

        //USER PUT FOR GOOGLE SIGN IN METHOD(upsert)
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //MAKE ADMIN OR NORMAL USERS
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //DIFFERENTIATE ADMIN CAN ONLY ADD ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user) {
                if (user.role === 'admin') {
                    isAdmin = true;
                }
                res.json({ admin: isAdmin });
            }
            else {
                res.json({ admin: isAdmin });
            }
            // res.json('dd');
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