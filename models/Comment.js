const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
  postId: {
    type: String,
  },
  post: {
    type: String,
  },
  comments: [
    {
      canReply: {
        type: Boolean,
      },
      from: {
        name: {
          type: String,
        },
        fromId: {
          type: String,
        },
      },
      message: {
        type: String,
      },
      messageId: {
        type: String,
      },
    },
  ],
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
