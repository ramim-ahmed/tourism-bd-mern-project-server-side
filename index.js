const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 8000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejor6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("tourismdb");
      const packagesCollection = database.collection("packages");
      const userBooksCollection = database.collection('books');
      
      //get packages api
      app.get('/packages', async (req, res) => {
          const cursor = packagesCollection.find({});
          const result = await cursor.toArray();
          res.send(result)
      })

      //get single tour package
      app.get('/package/:id', async (req, res) => {
          const {id} = req.params
          const query = {_id:ObjectId(id)}
          const result = await packagesCollection.findOne(query);
          res.send(result)
      })

      //get all boosk list api
      app.get('/allbooks', async (req, res) => {
          const cursor = userBooksCollection.find({});
          const result = await cursor.toArray();
          res.send(result)
      })

      //get user books api
      app.get('/books', async (req, res) => {
          const email = req.query.email;
          const filter = userBooksCollection.find({email:email});
          const result = await filter.toArray();
          res.send(result)
      })

      // add package post api
      app.post('/packages', async (req, res) => {
          const package = req.body;
          const result = await packagesCollection.insertOne(package);
          res.json(result)
      });
 
      //add packages book post api
      app.post('/books', async(req, res) => {
          const books = req.body;
          const result = await userBooksCollection.insertOne(books);
          res.json(result)
      });

      //update status 
      app.put('/updateStatus/:id', async (req, res) => {
          const id = req.params.id;
          const filter = {_id:ObjectId(id)};
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              status:"Aproved"
            },
          };
          const result = await userBooksCollection.updateOne(filter, updateDoc, options);
          res.json(result)
      })

      app.delete('/bookDelete/:id', async (req, res) => {
          const id = req.params.id;
          console.log(id);
          console.log('deleted hitted');
          const query = {_id:ObjectId(id)}
          const result = await userBooksCollection.deleteOne(query);
          res.send(result)
      })

    } finally {
    //   await client.close();
    }
  }

  //call function
  run().catch(console.dir);

//HOME API
app.get('/', (req, res) => {
  res.send('META TOURISM SERVER IS RUNNING......')
})

//APP LISTEN WITH PORT
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})