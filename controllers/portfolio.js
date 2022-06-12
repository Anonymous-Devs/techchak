const handler = require('../modules/portfolio/handler');
const projectHandler = require('../modules/projects/handler');



exports.getPortfolioByUserId = async (req, res, next) => {
 try {
  const {
   pid
  } = res.locals.user

  const data = await handler.getPortfolioByUserId(pid);
  res.status(data.code).json(data);
 } catch (err) {
  logger.error(err);
  res.status(err.code).json(err);
 }

}


exports.getPortfolioByUserIdAndProjectId = async (req, res, next) => {
 try {
  const {
   pid
  } = res.locals.user;

  const data = await handler.getPortfolioByUserIdAndProjectId(pid, req.params.projectId);
  res.status(data.code).json(data);
 } catch (err) {
  logger.error(err);
  res.status(err.code).json(err);
 }

}


exports.updatePortfolioProjectStatus = async (req, res, next) => {
 try {
  const {
   pid
  } = res.locals.user

  const data = await handler.updatePortfolioProjectStatus(pid, req.params.projectId, req.body.status);

  res.status(data.code).json(data);
 } catch (err) {
  logger.error(err);
  res.status(err.code).json(err);
 }

}

exports.addToDoProject = async (req, res, next) => {
 try {
  const {
   pid
  } = res.locals.user

  
  const data = await handler.addToDoProject(pid, req.params.projectId);

  res.status(data.code).json(data);
 } catch (err) {
  logger.error(err);
  res.status(err.code).json(err);
 }

}

exports.removeFromToDoProject = async (req, res, next) => {
 try {
  const {
   pid
  } = res.locals.user

  const data = await handler.removeFromToDoProject(pid, req.params.projectId);

  res.status(data.code).json(data);
 } catch (err) {
  logger.error(err);
  res.status(err.code).json(err);
 }

}


exports.submitProjectSolution = async (req, res, next) => {
 try{
  const {
   pid
  } = res.locals.user

  const body = res.locals.validatedBody;

  body.createdBy = pid;
  body.projectId = req.params.projectId;

  const data = await projectHandler.cs(body, req.query, res.locals.user);
  const submitedSolution = await handler.submitProjectSolution(pid, data);
  res.status(submitedSolution.code).json(submitedSolution);
 }
 catch(err){
  logger.error(err);
  res.status(err.code).json(err);
 }

}