"use strict"
const handler = require("../modules/testimonial/handler");

exports.create = async (req, res, next) => {
 try {
  const data = await handler.create(res.locals.validatedBody.testimony, res.locals.user);
  res.status(data.code).json(data)
 } catch (err) {
  logger.error(err.message)
  res.status(err.code).json(err)
 }
}

exports.update = async (req, res, next) => {
 try {
  const {
   id
  } = req.params;
  const data = await handler.update(id, res.locals.validatedBody);
  res.status(data.code).json(data)
 } catch (error) {
  logger.error(error)
  res.status(error.code).json(error)
 }
}

exports.getOne = async (req, res, next) => {
 try {
  const {
   id
  } = req.params;
  const data = await handler.getOne(id);
  res.status(data.code).json(data)
 } catch (error) {
  logger.error(error)
  res.status(error.code).json(error)
 }
}

exports.getMany = async (req, res, next) => {
 try {
  const data = await handler.getMany(req.query);
  res.status(data.code).json(data)
 } catch (error) {
  logger.error(error)
  res.status(error.code).json(error)
 }
}

exports.delete = async (req, res, next) => {
 try {
  const {
   id
  } = req.params;

  const data = await handler.delete(id)
  res.status(data.code).json(data)
 } catch (error) {
  logger.error(error)
  res.status(error.code).json(error)
 }
}