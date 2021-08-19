const express = require("express");
const app = express();
const router = express.Router();
const UserModel = require("../models/User");
const MessengerModel = require("../models/Messenger");
const request = require("request");
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.MESSENGER_TOKEN;

router.post("/", async (req, res) => {
  let data = req.body;
  const message = await MessengerModel.find({ profileId: data.id })
    .sort([["timestamp", 1]])
    .exec();
  res.json(message);
});

router.get("/", async (req, res) => {
  try {
    const inbox = await UserModel.find();
    res.json(inbox);
    console.log(inbox);
  } catch (e) {
    console.log(e);
  }
});

router.post("/postMessage", async (req, res) => {
  let data = req.body;
  let mid = getRandomMessageId();
  try {
    const inbox = await new MessengerModel({
      profileId: data.profileId,
      sender: {
        id: data.senderId,
      },
      recipient: {
        id: data.recipentId,
      },
      timestamp: Date.now(),
      message: {
        mid: mid,
        text: data.text,
      },
    });
    const saveMessage = await inbox.save();
    console.log(saveMessage);
    callSendAPI(data.recipentId, data.text);
  } catch (e) {
    console.log(e);
  }
});

function getRandomMessageId() {
  return "m_" + Math.random().toString(36);
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  console.log(response);
  console.log(sender_psid);
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: { text: response },
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
        //console.log(res);
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

module.exports = router;
