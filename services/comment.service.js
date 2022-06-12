/*jslint node: true */
// jshint esversion:8
"use strict";

const path = require("path"),
  {
    HTTP_OK,
    HTTP_BAD_REQUEST,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_NOT_FOUND,
    HTTP_CREATED,
  } = require(path.resolve('utils', 'http.response.code')),
  {
    INTERNAL_SERVER_ERROR,
    CREATE_COMMENT,
    UPDATE_COMMENT,
    DELETE_COMMENT,
    COMMENT_RETRIEVED,
    CREATE_COMMENT_FAILED,
    UPDATE_COMMENT_FAILED,
    DELETE_COMMENT_FAILED,
    COMMENT_NOT_FOUND,
    LIKED,
    LIKED_FAILED,
    UNLIKED,
    UNLIKED_FAILED,
  } = require("../utils/http.response.message"),
  ApiResponse = require(path.resolve(path.resolve("utils", "http.response"))),
  CommentModel = require("../modules/comments/model"),
  ProjectService = require("./project.service"),
  {
    W,
    VideoService
  } = require("./wikiAndVideo.service");

class Comment extends CommentModel {
  static async create(id, comment) {
    try {
      let type = comment.type;
      // set the project type as the key of the comment in the comment object
      comment[type] = id;

      let newComment = await new CommentModel(comment).populate([{
        path: "createdBy",
        populate: {
          path: "user",
          select: "-password -passwordArchived -defaultPassword",
        },
      }, ]);
      let response;
      if (newComment) {
        switch (type) {
          case 'project':
            await ProjectService.cc(id, newComment._id);
            await newComment.save();
            break;
          case 'wiki':
            await W.cc(id, newComment._id);
            await newComment.save();
            break;
          case 'video':
            response = await VideoService.cc(id, newComment._id);
            await newComment.save();
            break;
          default:
            throw ApiResponse.gen(
              HTTP_BAD_REQUEST,
              CREATE_COMMENT_FAILED,
              "Comment type is not valid"
            );
        }

        return ApiResponse.gen(HTTP_CREATED, CREATE_COMMENT, newComment);
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, CREATE_COMMENT_FAILED);
      }
    } catch (err) {
      if (err.code) throw err;
      const msg = err.message;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR,
        msg
      );
    }
  }

  static async update(id, comments) {
    try {
      const {
        comment
      } = comments;

      const updatedComment = await CommentModel.findByIdAndUpdate(id, {
        comment,
      });

      if (updatedComment) {
        return ApiResponse.gen(HTTP_OK, UPDATE_COMMENT, updatedComment);
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, UPDATE_COMMENT_FAILED);
      }
    } catch (err) {
      if (err.code) throw err;
      const msg = err.message;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR,
        msg
      );
    }
  }

  static async delete(id) {
    try {
      const deletedComment = await this.findByIdAndDelete(id);

      if (deletedComment) {
        return ApiResponse.gen(HTTP_OK, DELETE_COMMENT, deletedComment);
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, DELETE_COMMENT_FAILED);
      }
    } catch (err) {
      if (err.code) throw err;
      const msg = err.message;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR,
        msg
      );
    }
  }

  static async getCommentById(id) {
    try {
      const comment = await CommentModel.findById(id).populate("createdBy");
      if (comment) {
        return ApiResponse.gen(HTTP_OK, COMMENT_RETRIEVED, comment);
      } else {
        throw ApiResponse.gen(HTTP_NOT_FOUND, COMMENT_NOT_FOUND);
      }
    } catch (err) {
      if (err.code) throw err;
      const msg = err.message;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR,
        msg
      );
    }
  }

  static async getComments(query) {
    try {
      let {
        limit,
        offset
      } = query;

      delete query.limit;
      delete query.offset;

      limit = limit || Infinity;
      offset = offset > 0 ? offset - 1 : 0;

      const comments = await CommentModel.find({
          ...query,
        })
        .limit(limit)
        .skip(offset * limit);

      if (comments) {
        const pageCount = await this.countDocuments({
            ...query,
          }),
          data = {
            data: comments,
            totalPages: Math.ceil(pageCount / limit) || 1,
            page: parseInt(offset) + 1,
            perPage: parseInt(limit) || pageCount,
            pageCount: comments.length,
          };

        return ApiResponse.gen(HTTP_OK, COMMENT_RETRIEVED, data);
      } else {
        throw ApiResponse.gen(HTTP_NOT_FOUND, COMMENT_NOT_FOUND);
      }
    } catch (err) {
      if (err.code) throw err;
      const msg = err.message;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR,
        msg
      );
    }
  }

  static async deleteMany(query) {
    try {
      const deletedComment = await CommentModel.deleteMany(query);

      if (deletedComment) {
        return ApiResponse.gen(HTTP_OK, DELETE_COMMENT, deletedComment);
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, DELETE_COMMENT_FAILED);
      }
    } catch (err) {
      if (err.code) throw err;
      const msg = err.message;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR,
        msg
      );
    }
  }

  static async deleteByOwner(createdBy) {
    const deletedComment = await CommentModel.deleteMany({
      createdBy,
    });

    if (deletedComment) {
      return {
        name: "Comment",
        ...deletedComment,
      };
    } else {
      return {
        name: 'Comment',
        acknowledged: false,
        deletedCount: 0,
      };
    }
  }

  static async likeComment(comment, pid) {
    try {
      const {
        likes
      } = comment;

      if (likes.includes(pid)) {
        comment.likes = likes.filter((id) => id.toString() !== pid.toString());
        let data = await comment.save();
        if (data.likes.includes(pid) == false) {
          return ApiResponse.gen(HTTP_CREATED, UNLIKED, data);
        } else {
          throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, UNLIKED_FAILED);
        }
      } else {
        comment.likes.push(pid);
        let data = await comment.save();
        if (data.likes.includes(pid)) {
          return ApiResponse.gen(HTTP_OK, LIKED, data);
        } else {
          throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, LIKED_FAILED);
        }
      }
    } catch (err) {
      throw err;
    }
  }
}
module.exports = Comment;