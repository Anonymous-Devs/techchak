const videoHandler = require("../modules/video/handler"),
commentHandler = require("../modules/comments/handler"),
{
 logger
} = global;

exports.createVideo = async (req, res, next) => {
 try {

   const {
     user,
     validatedBody
   } = res.locals;
   validatedBody.createdBy = user.pid;
   const data = await videoHandler.createVideo(validatedBody, req);
   res.status(data.code).json(data);
 } catch (err) {
   logger.error(err);
   res.status(err.code).json(err);
 }
}

exports.j = async (req, res, next) => {
 try {

   const data = await videoHandler.getVideoByPagination(req.query, res.locals.user);
   res.status(data.code).json(data);
 } catch (err) {
    logger.error(err);
   res.status(err.code).json(err);
 }
}

exports.updateVideo = async (req, res, next) => {
 try {

   const {
     validatedBody
   } = res.locals;
   const data = await videoHandler.updateVideo(req.params.id, validatedBody);
   console.log(data)
   res.status(data.code).json(data);
 } catch (err) {
   logger.error(err);
   res.status(err.code).json(err);
 }
}

exports.findById = async (req, res, next) => {
 try {

   const data = await videoHandler.getVideoById(req.params.id);
   res.status(data.code).json(data);
 } catch (err) {
   logger.error(err);
   res.status(err.code).json(err);
 }
}

exports.deleteVideo = async (req, res, next) => {
 try {
   const {
     user
   } = res.locals;

   const data = await videoHandler.deleteVideo(req.params.id, user);

   res.status(data.code).json(data);
 } catch (err) {
   logger.error(err);
   res.status(err.code).json(err);
 }
}

exports.likeVideo = async (req, res, next) => {
 try {
   const {
     pid
   } = res.locals.user, {
     videoId
   } = req.params;

   const data = await videoHandler.likeVideo(videoId, pid)
   res.status(data.code).json(data)
 } catch (e) {
  logger.error(e);
   res.status(e.code).json(e)
 }
}

exports.cc = async (req, res, next) => {
  try {
    const {
      id
    } = req.params;

    const {
      validatedBody,
      user
    } = res.locals;
    validatedBody.createdBy = user.pid;
    validatedBody.type = 'video';

    const data = await commentHandler.cc(id, validatedBody);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}