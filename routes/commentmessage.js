const express = require("express");
const app = express();
const router = express.Router();
const UserModel = require("../models/User");
const MessengerModel = require("../models/Messenger");
const CommentModel = require("../models/Comment");
const request = require("request");
require("dotenv").config();
const axios = require("axios");
const e = require("express");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

router.get("/", async (req, res) => {
  console.log(PAGE_ACCESS_TOKEN);
  try {
    let response = await axios.get(
      `https://graph.facebook.com/155203489993364/feed/?fields=can_reply_privately,from,message,comments{can_reply_privately,from,message}&access_token=${PAGE_ACCESS_TOKEN}`
    );
    //let commentLength = response.data.data[0].comments.data.length;
    let postData = response.data.data;
    //let postId = response.data.data[0].from.id;
    //console.log("PAGE ID>>", pageId);
    /*postData.map(post=>
    let postExist = await CommentModel.exists({ postId: post.id });
    if(!postExist){

    }
    )*/
    postData.map(async (post) => {
      let postExist = await CommentModel.exists({ postId: post.id });
      //console.log("POST STATUS>>", postExist);
      if (postExist) {
        let existingPostData = await CommentModel.find({ postId: post.id });
        existingPostData.map((existingPost) => {
          if (existingPost.postId === post.id) {
            if (post.comments == undefined) {
              console.log("Without Comment", post);
            } else {
              console.log("with comment", post.comments);
              existingPost.comments = [];
              let commentArray = [];
              //console.log("POST DATA>>", post.comments.data);
              post.comments.data.map((comment) => {
                let commentObject = {
                  canReply: comment.can_reply_privately,
                  from: {
                    name: comment.from.name,
                    fromId: comment.from.id,
                  },
                  message: comment.message,
                  messageId: comment.id,
                };
                commentArray.push(commentObject);
              });
              existingPost.comments = commentArray;
              //console.log(existingPost.comments);
              existingPost.save();
              /*    existingPost.comments.map((existingComment) => {
                console.log(existingComment);
              }); */
            }

            /*  if (existingPost.comments.length == 0) {
              console.log("Without Comment", existingPost);
            } else {
              console.log("With COmment", existingPost);
            } */
          }
        });

        /*  if (post.comments == undefined) {
          const newPost = new CommentModel({
            postId: post.id,
            post: post.message,
          });
        } else {
          commentArray = [];
          post.comment.map((comment) => {
            let existingCommentArray = [];
            let commentArray = CommentModel.findOne({
              comment: {
                messageId: comment.id,
              },
            });
            console.log(commentArray);
          });
          /*const newPost = new CommentModel({
            postId: post.id,
            post: post.message,
            comment: [],
          });*/
      } else {
        if (post.comments == undefined) {
          //console.log(post);
          const newPost = new CommentModel({
            postId: post.id,
            post: post.message,
          });
          let saveMessage = newPost.save();
          console.log(saveMessage);
        } else {
          let commentArray = [];
          //console.log("POST DATA>>", post.comments.data);
          post.comments.data.map((comment) => {
            let commentObject = {
              canReply: comment.can_reply_privately,
              from: {
                name: comment.from.name,
                fromId: comment.from.id,
              },
              message: comment.message,
              messageId: comment.id,
            };
            commentArray.push(commentObject);
          });
          console.log(commentArray);
          let newPost = new CommentModel({
            postId: post.id,
            post: post.message,
            comments: commentArray,
          });
          let saveMessage = newPost.save();
          console.log(saveMessage);
        }
      }
    });

    //commentData.map((comment) => (
    //let commentExist = await CommentModel.exists({ id: profile.id });

    //))
    let finalValue = await CommentModel.find();
    console.log("FINAL VALUE>>", finalValue);
    res.send(finalValue);
  } catch (e) {
    console.log(e);
  }
});

router.post("/", async (req, res) => {
  let data = req.body;
  let postData = await CommentModel.find({ postId: data.id });
  postData.map((post) => {
    post.comments.map((comment) => {
      if (comment.messageId === data.commentId) {
        let resData = {
          messageId: comment.messageId,
          from: comment.from.fromId,
          message: comment.message,
          timestamp: Date.now(),
        };
        res.send(resData);
      }
    });
  });
});

router.post("/reply", async (req, res) => {
  let data = req.body;
  console.log(data);
  let response = await axios.post(
    `https://www.graph.facebook.com/${data.postId}?message="${data.message}, @[${data.userid}]"&access_token=${PAGE_ACCESS_TOKEN}`
  );
  console.log(response);
});

module.exports = router;
