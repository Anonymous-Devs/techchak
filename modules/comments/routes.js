const route = require('express').Router();
const Comment = require('../../controllers/comments');
const {
 validateAuthorization,
 validateUserAvailability
} = require('../../middlewares'),
BodyValidator = require('../../middlewares/bodyValidator');


route.get('/', validateAuthorization, validateUserAvailability, Comment.getAllComments);

route.get('/:id', validateAuthorization, validateUserAvailability, Comment.getCommentById);

route.put('/:id', validateAuthorization, validateUserAvailability, BodyValidator.cc, Comment.updateComment);

route.delete('/:id', validateAuthorization, validateUserAvailability, Comment.deleteComment);

route.post('/:commentId/like', validateAuthorization, validateUserAvailability, Comment.likeComment)

module.exports = route;