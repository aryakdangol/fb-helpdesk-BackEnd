"use strict";

const express = require("express");
const app = express();
require("dotenv").config();
const webhookRouter = require("./routes/webhooks");
const userRouter = require("./routes/usermessage");
const cors = require("cors");
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use("/webhook", webhookRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/userMessage", userRouter);

app.listen(process.env.PORT || 5000);

mongoose
  .connect(
    "mongodb://localhost/fb-helpdesk",
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  )
  .then(console.log("DATABASE CONNECTED SUCCESSFULLY"))
  .catch((e) => console.log(e));
