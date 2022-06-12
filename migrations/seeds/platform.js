const ObjectId = require('mongoose').Types.ObjectId;

const platformMockData = {
 _id: new ObjectId("6250d146aed7d263517f4122"),
 name: "TECHCHAK",
 logo: "https://res.cloudinary.com/remilekunelijah/image/upload/v1649448174/personal/avatar_pic.png",
 automate_app_acceptance: true,
 automate_app_acceptance_days: 90,
 automate_app_rejection: false,
 automate_app_rejection_days: 0,
 additional_settings: {
  "background": "#333",
  "color": "#fff",
  "theme": "dark"
 },
 createdAt: "2020-04-08T13:59:01.584+00:00",
 updatedAt: "2020-04-08T13:59:01.584+00:00"
}

module.exports = platformMockData