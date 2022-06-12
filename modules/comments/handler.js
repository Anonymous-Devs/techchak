const CommentService = require('../../services/comment.service');

exports.cc = async (d, b) => {
 
 const comment = await CommentService.create(d, b);
 return comment;

}

exports.getAllComments = async (query) => {
 
 const comments = await CommentService.getComments(query);
 return comments;

}

exports.getCommentById = async (id) => {
 
 const comment = await CommentService.getCommentById(id);
 return comment;

}

exports.updateComment = async (id, body) => {
 
 const comment = await CommentService.update(id, body);
 return comment;

}

exports.deleteComment = async (id) => {
 
 const comment = await CommentService.delete(id);
 return comment;

}

exports.likeComment = async (commentId, pid) => {
 const comment = await CommentService.getCommentById(commentId)
 const data = await CommentService.likeComment(comment.data, pid)
 return data
};