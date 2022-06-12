const mongoose = require("mongoose");
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const { Schema, model } = mongoose;

const PrivateChatSchema = new Schema(
  {
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Profile",
      },
    ],
    lastChatMessage: {
      type: mongoose.Schema.ObjectId,
      ref: "PrivateChatMessage",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("PrivateChat", PrivateChatSchema);
