const mongoose = require("mongoose");

const MesssengerSchema = mongoose.Schema({
  profileId: {
    type: String,
  },
  sender: {
    id: {
      type: String,
    },
  },
  recipient: {
    id: {
      type: String,
    },
  },
  timestamp: {
    type: Date,
  },
  message: {
    mid: {
      type: String,
    },
    text: {
      type: String,
    },
  },
});

const Messages = mongoose.model("Messages", MesssengerSchema);

module.exports = Messages;
