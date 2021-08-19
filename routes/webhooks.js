const express = require("express");
require("dotenv").config();
const router = express.Router();
const request = require("request");
const axios = require("axios");
const UserModel = require("../models/User");
const MessengerModel = require("../models/Messenger");

const PAGE_ACCESS_TOKEN = process.env.MESSENGER_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

router.post("/", async (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      getProfileDetails(sender_psid).then((profile) => {
        console.log(profile);
        postDetails(profile, webhook_event);
      });

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

router.get("/", (req, res) => {
  // Your verify token. Should be a random string.

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function callSendAPI(sender_psid, response) {
  // Construct the message body
  console.log(response);
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
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
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "yes") {
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

async function getProfileDetails(sender_psid) {
  try {
    let response = await axios.get(
      `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic`,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

async function postDetails(profile, webhook_event) {
  try {
    console.log("PROFILE IN POSTDETAILS >>>", profile);
    let userExist = await UserModel.exists({ id: profile.id });
    if (!userExist) {
      const newUser = new UserModel({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        profile_pic: profile.profile_pic,
      });
      const savedUser = await newUser.save();
      console.log(savedUser);
    }
    const newMessage = new MessengerModel({
      profileId: profile.id,
      sender: {
        id: webhook_event.sender.id,
      },
      recipient: {
        id: webhook_event.recipient.id,
      },
      timestamp: webhook_event.timestamp,
      message: {
        mid: webhook_event.message.mid,
        text: webhook_event.message.text,
      },
    });
    const savedMessage = await newMessage.save();
    console.log(savedMessage);
  } catch (e) {
    console.log(e);
  }
}

module.exports = router;
