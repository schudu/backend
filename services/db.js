const mongoose = require("mongoose");

let db;

async function connection() {
  if (db) return db;

  const connectionOptions = {
    useNewUrlParser: true,
  };

  if (process.env.NODE_ENV === "production") {
    console.log("Conntecting to Production Database...");

    //mongodb://localhost:27017/test
    db = await mongoose.connect(process.env.MONGODB_URL, connectionOptions);

    console.log("Connected to Production Database");
  } else {
    console.log("Conntecting to Developement Database...");
    // in development, need to store the db connection in a global variable
    // this is because the dev server purges the require cache on every request
    // and will cause multiple connections to be made
    if (!global.__db) {
      global.__db = await mongoose.connect(
        "mongodb://127.0.0.1:27017/schudu",
        connectionOptions
      );
      console.log("Connected to Developement Database");
    } else console.log("Already connected to Developement Database");
    db = global.__db;
  }
  return db;
}

module.exports = connection;
