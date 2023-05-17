const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Toytopis-Kids Server is Running");
});

app.listen(port, () => {
  console.log(`Toytopia-Kids Server is Running on port: ${port}`);
});
