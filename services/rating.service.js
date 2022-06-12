const Model = require('../modules/rating/model');

module.exports = class Rating extends Model {

 static async createRating(resourseId, type) {
  const data = {
   type
  };
  data[type] = resourseId;

  const rating = await this.create(data)

  return rating;
 }

 static async rate(resourseId, {
  pid,
  type,
  weight
 }) {

  const payload = {
   type
  };
  payload[type] = resourseId;

  const rating = await this.findOne(payload),
   {
    data
   } = rating,
   users = [];
  if (data.length > 0) {
   for (let i in data) users.push(data[i].user.toString())
   if (users.includes(pid)) {
    for (let i in data) {
     if (data[i].user == pid) {
      data[i].weight = weight;
     }
    }
   } else {
    data.push({
     user: pid,
     weight
    });
   }
  } else {
   data.push({
    user: pid,
    weight
   });
  }

  let _5Star = data.filter(item => item.weight == 5).length,
   _4_5Star = data.filter(item => item.weight == 4.5).length,
   _4Star = data.filter(item => item.weight == 4).length,
   _3_5Star = data.filter(item => item.weight == 3.5).length,
   _3Star = data.filter(item => item.weight == 3).length,
   _2_5Star = data.filter(item => item.weight == 2.5).length,
   _2Star = data.filter(item => item.weight == 2).length,
   _1_5Star = data.filter(item => item.weight == 1.5).length,
   _1Star = data.filter(item => item.weight == 1).length,
   _0_5Star = data.filter(item => item.weight == 0.5).length;

  let overallRating = _5Star * 5 + _4_5Star * 4.5 + _4Star * 4 + _3_5Star * 3.5 + _3Star * 3 + _2_5Star * 2.5 + _2Star * 2 + _1_5Star * 1.5 + _1Star * 1 + _0_5Star * 0.5;

  let sumOfRating = _5Star + _4_5Star + _4Star + _3_5Star + _3Star + _2_5Star + _2Star + _1_5Star + _1Star + _0_5Star;

  const averageRating = overallRating / sumOfRating;

  const result = await this.findByIdAndUpdate(rating._id, {
   data: data,
   averageRating: averageRating.toFixed(2)
  });


  return result
 }

 static async deleteRating(resourseId, type) {
  const data = {
   type
  };
  data[type] = resourseId;
  let deleted = await this.findOneAndDelete(data)

  return deleted;
 }
}