/*** TESTIMONIAL ***/
const ProfileService = require('../../services/profile.service');
const TestimonialService = require('../../services/testimonial.service');


exports.create = async (testimony, user) => {
 const {
  pid
 } = user;
 const profile = await ProfileService.findById(pid)
 const {
  firstName,
  lastName,
  avatar,
  department,
  area
 } = profile;


 const body = {
  name: firstName.concat(' ', lastName),
  image: avatar,
  department,
  area,
  testimony,
  createdBy: pid
 }

 const data = await TestimonialService.createTestimony(body)
 return data
}

exports.update = async (id, body) => {
 const data = await TestimonialService.updateTestimony(id, body)
 return data
}

exports.getOne = async (id) => {
 const data = await TestimonialService.getSingleTestimony(id)
 return data
}

exports.getMany = async (query) => {

 const data = await TestimonialService.getTestimonials(query)
 return data
}

exports.delete = async (id) => {
 const data = await TestimonialService.deleteTestimony(id)
 return data

}