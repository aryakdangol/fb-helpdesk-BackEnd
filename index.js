"use strict";

const express = require("express");
const app = express();
require("dotenv").config();
const webhookRouter = require("./routes/webhooks");
const userRouter = require("./routes/usermessage");
const commentRouter = require("./routes/commentmessage");
const cors = require("cors");
const mongoose = require("mongoose");

const URL = process.env.MONGO_URL;
console.log(URL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/webhook", webhookRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/userMessage", userRouter);
app.use("/userComments", commentRouter);

app.listen(process.env.PORT || 5000);

mongoose
  .connect(URL, { useNewUrlParser: true }, { useUnifiedTopology: true })
  .then(console.log("DATABASE CONNECTED SUCCESSFULLY"))
  .catch((e) => console.log(e));
