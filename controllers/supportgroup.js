const mongoose = require('mongoose');
const supportGroupHandler = require('../modules/support-group/handler');
const { logger } = global;

const { HTTP_OK, HTTP_CREATED } = require('../utils/http.response.code');

exports.createGroup = async (req, res, next) => {
  try {
    const group = await supportGroupHandler.createGroup(
      res.locals.validatedBody
    );
    res.status(HTTP_CREATED).json(group);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.updateGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await supportGroupHandler.updateGroup(
      id,
      res.locals.validatedBody
    );
    res.status(HTTP_OK).json(data);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.getSingleGroup = async (req, res) => {
  const { id } = req.params;
  let result = await supportGroupHandler.getSingleGroup(id);

  if (!result) {
    result = { message: 'Group data is not available', success: false };
    return res.status(HTTP_OK).json(result);
  }

  return res.status(HTTP_OK).json(result);
};

exports.fetchGroups = async (req, res, next) => {
  try {
    const query = req.query;
    const result = await supportGroupHandler.fetchGroups(query);
    res.status(HTTP_OK).json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.fetchGroupsWithReads = async (req, res, next) => {
  try {
    const query = req.query;
    const result = await supportGroupHandler.fetchGroupsWithReads(
      query,
      mongoose.Types.ObjectId(res.locals.user.id)
    );
    res.status(HTTP_OK).json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await supportGroupHandler.deleteGroup(id);
    res.status(HTTP_OK).json({
      success: true,
      message: 'group deleted successfully',
      ...result,
    });
  } catch (err) {
    res.status(err.code).json(err);
  }
};
