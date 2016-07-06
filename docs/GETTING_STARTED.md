# Getting started

The quick start guide will show you how to setup a simple application using node.js and MongoDB. Its scope is only how to set up the driver and perform the simple <abbr title="Create Read Update Delete">crud</abbr> operations.

Installing monk
---------------------------
Use **NPM** to install `monk`.

```
npm install --save monk
```

Booting up a MongoDB Server
---------------------------
Let's boot up a MongoDB server instance. Download the right MongoDB version from [MongoDB](http://www.mongodb.org), open a new shell or command line and ensure the **mongod** command is in the shell or command line path. Now let's create a database directory (in our case under **/data**).

```
mongod --dbpath=/data --port 27017
```

You should see the **mongod** process start up and print some status information.

Connecting to MongoDB
---------------------
Let's create a new **app.js** file that we will use to show the basic CRUD operations using monk.

First let's add code to connect to the server and the database **myproject**.

```js
const monk = require('monk')

// Connection URL
const url = 'localhost:27017/myproject';

const db = monk(url);

db.then(() => {
  console.log('Connected correctly to server')
})
```

Given that you booted up the **mongod** process earlier the application should connect successfully and print **Connected correctly to server** to the console.

If you are not sure what the `then` is or not up to speed with `Promises`, you might want to check out some tutorials first.

Let's Add some code to show the different CRUD operations available.

Inserting a Document
--------------------
Let's insert some documents in the `documents` collection.

```js
const url = 'localhost:27017/myproject'; // Connection URL
const db = require('monk')(url);

const collection = db.get('document')

collection.insert([{a: 1}, {a: 2}, {a: 3}])
  .then((docs) => {
    // docs contains the documents inserted with added **_id** fields
    // Inserted 3 documents into the document collection
  }).catch((err) => {
    // An error happened while inserting
  }).then(() => db.close())
```

You can notice that we are not waiting for the connection to be opened before doing the operation. That's because behind the scene, monk will queue all the operations until the connection is opened and then send them.

We can now run the update **app.js** file.

```
node app.js
```

You should see the following output after running the **app.js** file.

```
Inserted 3 documents into the document collection
```

Updating a document
-------------------
Let's look at how to do a simple document update by adding a new field **b** to the document that has the field **a** set to **2**.

```js
const url = 'localhost:27017/myproject'; // Connection URL
const db = require('monk')(url);

const collection = db.get('document')

collection.insert([{a: 1}, {a: 2}, {a: 3}])
  .then((docs) => {
    // Inserted 3 documents into the document collection
  })
  .then(() => {

    return collection.update({ a: 2 }, { $set: { b: 1 } })

  })
  .then((result) => {
    // Updated the document with the field a equal to 2
  })
  .then(() => db.close())
```

The method will update the first document where the field **a** is equal to **2** by adding a new field **b** to the document set to **1**.

Delete a document
-----------------
Next let's delete the document where the field **a** equals to **3**.

```js
const url = 'localhost:27017/myproject'; // Connection URL
const db = require('monk')(url);

const collection = db.get('document')

collection.insert([{a: 1}, {a: 2}, {a: 3}])
  .then((docs) => {
    // Inserted 3 documents into the document collection
  })
  .then(() => collection.update({ a: 2 }, { $set: { b: 1 } }))
  .then((result) => {
    // Updated the document with the field a equal to 2
  })
  .then(() => {

    return collection.remove({ a: 3})

  }).then((result) => {
    // Deleted the document with the field a equal to 3
  })
  .then(() => db.close())
```

This will delete the first document where the field **a** equals to **3**.

Find All Documents
------------------
We will finish up the CRUD methods by performing a simple query that returns all the documents matching the query.

```js
const url = 'localhost:27017/myproject'; // Connection URL
const db = require('monk')(url);

const collection = db.get('document')

collection.insert([{a: 1}, {a: 2}, {a: 3}])
  .then((docs) => {
    // Inserted 3 documents into the document collection
  })
  .then(() => collection.update({ a: 2 }, { $set: { b: 1 } }))
  .then((result) => {
    // Updated the document with the field a equal to 2
  })
  .then(() => collection.remove({ a: 3}))
  .then((result) => {
    // Deleted the document with the field a equal to 3
  })
  .then(() => {

    return collection.find()

  })
  .then((docs) => {
    // docs === [{ a: 1 }, { a: 2, b: 1 }]
  })
  .then(() => db.close())
```

This query will return all the documents in the **documents** collection. Since we deleted a document the total
documents returned is **2**.

This concludes the Getting Started of connecting and performing some Basic operations using monk.
