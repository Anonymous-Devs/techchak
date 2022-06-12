const handler = require("../modules/comments/handler");

exports.getAllComments = async (req, res, next) => {
  try {
    const comments = await handler.getAllComments(req.query);
    res.status(comments.code).json(comments);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.updateComment = async (req, res, next) => {
  try {
    const {
      id
    } = req.params;

    const {
      validatedBody
    } = res.locals;

    const data = await handler.updateComment(id, validatedBody);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.getCommentById = async (req, res, next) => {
  try {
    const {
      id
    } = req.params;

    const data = await handler.getCommentById(id);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.deleteComment = async (req, res, next) => {

  try {
    const {
      id
    } = req.params;

    const data = await handler.deleteComment(id);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err)
    res.status(err.code).json(err);
  }
}

exports.likeComment = async (req, res, next) => {
  try {
    const {
      pid
    } = res.locals.user;
    const data = await handler.likeComment(req.params.commentId, pid)

    res.status(data.code).json(data)
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err)
  }

}