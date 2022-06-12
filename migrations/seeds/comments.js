const ObjectId = require('mongoose').Types.ObjectId,
 {
  projects
 } = require("./projects"),
 commentIds = [new ObjectId("624d9bf9aaa4af0d6e0ee44a"), new ObjectId("624da238b239569442a3f58f")],
 fellow = require("./fellows");


const comments = [{
  _id: commentIds[0],
  type: "project",
  project: projects[0]._id,
  comment: "I am creating my solution for this project",
  createdBy: fellow.profile[0]._id,
  createdAt: "2022-04-04T14:30:09.301+00:00",
  updatedAt: "2022-04-08T13:59:01.584+00:00"
 },
 {
  _id: commentIds[1],
  type: "project",
  project: projects[1]._id,
  comment: "I love this projects",
  createdBy: fellow.profile[1]._id,
  createdAt: "2022-04-04T14:30:09.301+00:00",
  updatedAt: "2022-04-08T13:59:01.584+00:00"
 }
];

module.exports = {
 comments,
 commentIds
}