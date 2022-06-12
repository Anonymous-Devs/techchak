const ObjectId = require('mongoose').Types.ObjectId,
ratingsId = [
  new ObjectId("624d9bf9aaa4af0d6e0ee12a"),
  new ObjectId("624da238b239569442a3f22b"),
  new ObjectId("624d9bf9aaa4af0d6e0ee12c"),
  new ObjectId("624da238b239569442a3f481"),
  new ObjectId("624d9bf9aaa4af0d6e0fe12d"),
  new ObjectId("624dabf9aaa4af0d6e0ee12a"),
  new ObjectId("624db238b239569442a3f22b"),
  new ObjectId("624dcbf9aaa4af0d6e0ee12c"),
  new ObjectId("624de238b239569442a3f481"),
  new ObjectId("624dfbf9aaa4af0d6e0fe12d")
];

  let projectsId = require('./projects').projects.map(project => project._id);
  const cloudProjectsId = require("./cloud_projects.js").map(project => project._id);
  
  projectsId = [...projectsId, ...cloudProjectsId];

const pids = require('./fellows').profile.map(f => f._id);

const ratings = [
{
 _id: ratingsId[0],
 project: projectsId[0],
 type: 'project',
 data: [
  {
  user: pids[0],
  weight: 5
 },
 {
  user: pids[1],
  weight: 3.5
 },
 {
  user: pids[2],
  weight: 4
 },
],
 averageRating: 4.11,
},
{
 _id: ratingsId[1],
 project: projectsId[1],
 type: 'project',
 data: [
  {
  user: pids[2],
  weight: 3.5
 },
 {
  user: pids[1],
  weight: 3
 }
],
 averageRating: 4.32,
},
{
 _id: ratingsId[2],
 project: projectsId[2],
 type: 'project',
 data: [
  {
  user: pids[0],
  weight: 3.5
 },
 {
  user: pids[2],
  weight: 2.5
 }
],
 averageRating: 3.75,
},
{
 _id: ratingsId[3],
 project: projectsId[3],
 type: 'project',
 data: [
  {
  user: pids[1],
  weight: 3.5
 },
 {
  user: pids[0],
  weight: 1.5
 }
],
 averageRating: 2.75,
},
{
 _id: ratingsId[4],
 project: projectsId[4],
 type: 'project',
 data: [
  {
  user: pids[1],
  weight: 5
 },
 {
  user: pids[0],
  weight: 4.5
 }
],
 averageRating: 4.75,
},

{
  _id: ratingsId[5],
  project: projectsId[5],
  type: 'project',
  data: [
   {
   user: pids[0],
   weight: 5
  },
  {
   user: pids[1],
   weight: 3.5
  },
  {
   user: pids[2],
   weight: 4
  },
 ],
  averageRating: 4.11,
 },
 {
  _id: ratingsId[6],
  project: projectsId[6],
  type: 'project',
  data: [
   {
   user: pids[2],
   weight: 3.5
  },
  {
   user: pids[1],
   weight: 3
  }
 ],
  averageRating: 4.32,
 },
 {
  _id: ratingsId[7],
  project: projectsId[7],
  type: 'project',
  data: [
   {
   user: pids[0],
   weight: 3.5
  },
  {
   user: pids[2],
   weight: 2.5
  }
 ],
  averageRating: 3.75,
 },
 {
  _id: ratingsId[8],
  project: projectsId[8],
  type: 'project',
  data: [
   {
   user: pids[1],
   weight: 3.5
  },
  {
   user: pids[0],
   weight: 1.5
  }
 ],
  averageRating: 2.75,
 },
 {
  _id: ratingsId[9],
  project: projectsId[9],
  type: 'project',
  data: [
   {
   user: pids[1],
   weight: 5
  },
  {
   user: pids[0],
   weight: 4.5
  }
 ],
  averageRating: 4.75,
 }
]

module.exports = ratings;