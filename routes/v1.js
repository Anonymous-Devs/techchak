const api = require("express")();
const { route } = helper;

api.use("/auth", route("account"));
api.use("/user", route("user"));
api.use("/project", route("projects"));
api.use("/wiki", route("wiki"));
api.use("/video", route("video"));
api.use("/portfolio", route("portfolio"));
api.use("/comment", route("comments"));
api.use("/platform", route("platform"));
api.use("/testimonial", route("testimonial"));
api.use("/support/group", route("support-group"));
api.use("/support/chat", route("group-chat-message"));
api.use("/private/chat", route("chat-message"));
api.use("/waitlist", route("waitlist"));

module.exports = api;
