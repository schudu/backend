const mongoose = require("mongoose");

module.exports = async function connection() {
  try {
    const connectionOptions = {
      useNewUrlParser: true,
    };

    if (process.env.NODE_ENV === "development")
      await mongoose.connect(
        "mongodb://localhost:27017/schudu",
        connectionOptions
      );
    else await mongoose.connect(process.env.SCHUDU_DB, connectionOptions);
    console.log("Connected to database.");
  } catch (error) {
    console.log(error, "Could not connect to database.");
  }
};
