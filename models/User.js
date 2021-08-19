const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  id: {
    type: String,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  profile_pic: {
    type: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
