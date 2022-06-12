const portfolioService = require('../../services/portfolio.service');
const projectService = require('../../services/project.service');

const {
  CANT_ADD_YOUR_OWN_PROJECT_TO_YOUR_TO_DO_LIST
} = require('../../utils/http.response.message'),
{
  HTTP_FORBIDDEN
} = require('../../utils/http.response.code');

/**
 * @description - Gets a users portfolio by their Profile ID
 * @param {String} pid - User profile ID 
 * @returns user portfolio
 */
exports.getPortfolioByUserId = async (pid) => {
  const portfolio = await portfolioService.getPortfolioByUserId(pid);

  return portfolio;
}

exports.getPortfolioByUserIdAndProjectId = async (pid, projectId) => {
  const project = await projectService.getProjectById(projectId);
 
 const portfolio = await portfolioService.getPortfolioByUserIdAndProjectId(pid, projectId, project.type);

 return portfolio;
}

exports.updatePortfolioProjectStatus = async (pid, projectId, status) => {
  const project = await projectService.getProjectById(projectId);

  const portfolio = await portfolioService.updatePortfolioProjectStatus(pid, {projectId, type: project.type, status});

  return portfolio;
}

exports.addToDoProject = async (pid, projectId) => {

  const project = await projectService.getProjectById(projectId);
  // restrict project creator from adding their own project to their to do list
  if(project.createdBy._id.toString() === pid) throw {code: HTTP_FORBIDDEN, message: CANT_ADD_YOUR_OWN_PROJECT_TO_YOUR_TO_DO_LIST};
  
  const portfolio = await portfolioService.addToDoProject(pid, {projectId, type: project.type});

  return portfolio;
}

exports.removeFromToDoProject = async (pid, projectId) => {
  const project = await projectService.getProjectById(projectId);

  const portfolio = await portfolioService.removeFromToDoProject(pid, project);
  return portfolio;

}

exports.submitProjectSolution = async (pid, project) => {
  const portfolio = await portfolioService.submitProjectSolution(pid, project);

  return portfolio;
}