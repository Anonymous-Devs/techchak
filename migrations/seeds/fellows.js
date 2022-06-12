const ObjectId = require('mongoose').Types.ObjectId;
const dayjs = require('dayjs');
const accountId = [new ObjectId("6250cf1343f8921a9aa41342"), new ObjectId("6250cb52d1dc74f5918fa6c9"), new ObjectId("6250d4e0c72fa2ec3af071d2")];
const profileId = [new ObjectId("6250af19437b0c758ea91caf"), new ObjectId("624b75404d93a9f667946172"), new ObjectId("624a588b3581fae7d2d3cd0a")]

const {
  projects
} = require("./projects");

const account = [{
    _id: accountId[0],
    email: "adenijiopeyemi68@gmail.com",
    password: "$2b$10$M.BWL5TSna8syND2Y/kyo./i3RINzwoDWRzSgbOyd/YreblCvpjNa", // 970b15f7ec
    defaultPassword: "9c81a8351832a80c6516d2214a6cdc0c:2ad597b97086d63936bc66e51d88a113", // 970b15f7ec
    passwordArchived: [],
    role: "fellow",
    status: "inactive",
    applicationStatus: "accepted",
    isEnabled: true,
    lastLogin: dayjs(new Date()).format("YYYY-MM-DD HH:mm"),
    createdAt: "2020-04-08T19:07:36.000Z",
    updatedAt: "2020-04-08T19:07:36.000Z",
  },
  {
    _id: accountId[1],
    email: "isiakalukmandellyson@gmail.com",
    password: "$2b$10$5XEG9Y/4s4nJYS1JT7MCW.quufacQEIL3e/c6WiSAFXuWwKWqgprS", // 0c1c5ca027
    defaultPassword: null,
    passwordArchived: [],
    status: "inactive",
    isEnabled: true,
    lastLogin: dayjs(new Date()).format("YYYY-MM-DD HH:mm"),
    applicationStatus: "accepted",
    role: "fellow",
    createdAt: "2022-04-04T22:46:24.486+00:00",
    updatedAt: "2022-04-04T22:54:02.859+00:00"
  },
  {
    _id: accountId[2],
    email: "okirigabriel24@gmail.com",
    password: "$2b$10$j0zKBsbftqcuanwGPyzYDufzc1uV765dMEgl8qoYZ/.4NA61t1SYa", // 9210716db0
    defaultPassword: "e3318aa4ce288567cc926c51c568b296:e3f29cf71d754d5c4da9d2659141042f", // 9210716db0
    passwordArchived: [],
    role: "fellow",
    status: "inactive",
    applicationStatus: "accepted",
    isEnabled: true,
    lastLogin: dayjs(new Date()).format("YYYY-MM-DD HH:mm"),
    createdAt: "2020-04-08T19:07:36.000Z",
    updatedAt: "2020-04-08T19:07:36.000Z",
  }
]


const profile = [{
    _id: profileId[0],
    user: accountId[0],
    number: "+2348164734220",
    email: "adenijiopeyemi68@gmail.com",
    firstName: "Opeyemi",
    lastName: "Adeniji",
    preferredName: "Ope",
    country: "Nigeria",
    state: "Ogun",
    certification: "Responsive web design",
    avatar: "https://ds20de4grf4xk.cloudfront.net/backend-uploads/profile/1651606841649_profile.jpeg",
    coverImage: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648212327/Learno/techchak.jpg",
    portfolioLink: "https://github.com/OpeyemiAdeniji",
    department: "cloud",
    area: "aws infrastructure",
    skillset: ["AWS", "AZURE"],
    experienceLevel: "Intermediate",
    resume: "https://www.tutorialspoint.com/javascript/javascript_tutorial.pdf",
    reasonForJoining: "Just interested",
    createdAt: "2020-04-08T20:07:36.000Z",
    updatedAt: "2020-04-08T20:07:36.000Z",
  },
  {
    _id: profileId[1],
    user: accountId[1],
    email: "isiakalukmandellyson@gmail.com",
    firstName: "isiaka",
    lastName: "Lukman",
    preferredName: "dellyson",
    number: "+2348103742587",
    country: "Afghanistan",
    state: "Khōst",
    portfolioLink: "iamdellyson.com",
    department: "cloud",
    area: "aws infrastructure",
    skillset: ["CLOUD", "AWS", "AZURE"],
    experienceLevel: "Intermediate",
    resume: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648194050/pvzyvlbhakmfkrq9bwmn.pdf",
    reasonForJoining: "Interested sha",
    createdAt: "2022-04-04T22:46:24.607+00:00",
    updatedAt: "2022-04-04T22:46:24.607+00:00",
    avatar: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648212327/Learno/techchak.jpg",
    coverImage: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648212327/Learno/techchak.jpg",

  },
  {
    _id: profileId[2],
    user: accountId[2],
    email: "okirigabriel24@gmail.com",
    firstName: "Okiri",
    lastName: "Gabriel",
    preferredName: "Okiri",
    number: "+2349067788730",
    country: "Nigeria",
    state: "Ogun",
    portfolioLink: "http://github.com/okirigabriel",
    department: "cloud",
    area: "aws infrastructure",
    skillset: ["CLOUD", "AWS"],
    experienceLevel: "Intermediate",
    resume: "https://www.tutorialspoint.com/javascript/javascript_tutorial.pdf",
    reasonForJoining: "Interested sha",
    createdAt: "2022-04-04T22:46:24.607+00:00",
    updatedAt: "2022-04-04T22:46:24.607+00:00",
    avatar: "https://ds20de4grf4xk.cloudfront.net/backend-uploads/profile/1651607041149_profile.jpeg",
    coverImage: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648212327/Learno/techchak.jpg",

  }
]

let project = {
  roadmap: [],
  personal: []
};

for (let p of projects) {
  if (p.type.toLowerCase() == 'personal') {
    // set up users roadmap
    project.roadmap.push({
      name: p.title,
      status: "incomplete",
      eta: p.eta,
      project: p._id
    })
    // set up users To-Do projects
    project.personal.push({
      status: 'To Do',
      project: p._id
    })
  }
}

const portfolio = [{
    _id: new ObjectId("625bfa006bc5509231ae6211"),
    user: profileId[0],
    totalProjectCreated: 0,
    totalProjectCompleted: 0,
    roadmap: project.roadmap,
    personal: project.personal,
    myTeam: [],
    capstone: [],
    team: [],
    createdAt: "2022-04-18T04:37:54.270Z",
    updatedAt: "2022-04-18T04:37:54.270Z"
  },
  {
    _id: new ObjectId("625afa006bc5509231ae6906"),
    user: profileId[1],
    totalProjectCreated: 0,
    totalProjectCompleted: 0,
    roadmap: project.roadmap,
    personal: project.personal,
    myTeam: [],
    capstone: [],
    team: [],
    createdAt: "2022-04-18T04:37:54.270Z",
    updatedAt: "2022-04-18T04:37:54.270Z"
  },
  {
    _id: new ObjectId("625afa006bc5509231ae0116"),
    user: profileId[2],
    totalProjectCreated: 0,
    totalProjectCompleted: 0,
    roadmap: project.roadmap,
    personal: project.personal,
    myTeam: [],
    capstone: [],
    team: [],
    createdAt: "2022-04-18T04:37:54.270Z",
    updatedAt: "2022-04-18T04:37:54.270Z"
  }
]

module.exports = {
  account,
  profile,
  portfolio
}