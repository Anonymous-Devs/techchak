"use strict"
const handler = require("../modules/projects/handler"),
  commentHandler = require("../modules/comments/handler");

exports.getFilteredProjects = async (req, res, next) => {
  try {
    const {
      pid,
      role
    } = res.locals.user;

    const data = await handler.getFilteredProjects(req.query, {
      pid,
      role
    });
    res.status(data.code).json(data);
  } catch (err) {
    res.status(err.code).json(err);
  }
}

exports.createProject = async (req, res, next) => {
  try {
    const {
      validatedBody,
      user
    } = res.locals, {
      pid,
      role
    } = user;

    const params = req.query;

    const data = await handler.createProject({
      role,
      pid,
      params,
      files: req.files
    }, validatedBody);
    res.status(data.code).json(data);
  } catch (err) {
    res.status(err.code).json(err);
  }
}

exports.getProjectById = async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const data = await handler.getProject(id);

    res.status(data.code).json(data);
  } catch (err) {
    res.status(err.code).json(err);
  }
}

exports.updateProject = async (req, res, next) => {
  try {
    const {
      id
    } = req.params;

    const {
      validatedBody
    } = res.locals;

    const data = await handler.updateProject(id, validatedBody, req.files);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.deleteProject = async (req, res, next) => {
  try {

    const {
      id
    } = req.params;

    const user = {
      ...res.locals.user,
      body: req.body
    };

    const data = await handler.deleteProject(id, user); // [077w8sww, {id:iquq38, role: "SuperAdmin"}]
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
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
    validatedBody.type = 'project';

    const data = await commentHandler.cc(id, validatedBody);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.likeProject = async (req, res, next) => {
  try {
    const {
      projectId
    } = req.params, {
      pid
    } = res.locals.user

    const data = await handler.likeProject(projectId, pid);

    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.rateProject = async (req, res, next) => {
  try {
    const {
      projectId
    } = req.params, {
      pid
    } = res.locals.user;

    const data = await handler.rateProject(projectId, {
      pid,
      rating: req.body.rating
    });

    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

/***** LINKEDIN SHARE *****/
exports.authorizeLinkedinUser = async (req, res, next) => {
  try {
    const {
      id
    } = req.params;

    const url = await handler.authorizeLinkedinUser();
    res.redirect(url);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.getUserAccessToken = async (req, res, next) => {
  try {
    const {
      code
    } = req.query;

    const data = await handler.getUserAccessToken(code);
    res.locals.access_token = data.access_token;
    next();
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.getLinkedinUser = async (req, res, next) => {
  try {
    const {
      access_token
    } = res.locals;

    const data = await handler.getLinkedinUser(access_token);
    res.redirect(`/v1/project/share/?urn=${data.id}&access_token=${access_token}`);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.sharePostToLinkedin = async (req, res, next) => {
  try {
    const {
      urn,
      access_token
    } = req.query;

    const data = await handler.sharePostToLinkedin(access_token, urn);
    res.status(data.code).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}