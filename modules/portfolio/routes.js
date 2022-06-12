const api = require('express').Router();
const controller = require('../../controllers/portfolio');

const {
 validateAuthorization,
 validateUserAvailability,
 validateAdmin
} = require('../../middlewares');
const BodyValidator = require('../../middlewares/bodyValidator');
const {
 updatePortfolioProjectStatus
} = require('../../middlewares/bodyValidator')

api.get('/', validateAuthorization, validateUserAvailability, controller.getPortfolioByUserId);

api.get('/project/:projectId', validateAuthorization, validateUserAvailability, controller.getPortfolioByUserIdAndProjectId);

api.put('/project/:projectId', validateAuthorization, validateUserAvailability, updatePortfolioProjectStatus, controller.updatePortfolioProjectStatus);

api.post('/project/:projectId', validateAuthorization, validateUserAvailability, controller.addToDoProject);

api.delete('/project/:projectId', validateAuthorization, validateUserAvailability, controller.removeFromToDoProject);

api.post("/project/:projectId/solution", validateAuthorization, validateUserAvailability, BodyValidator.c, controller.submitProjectSolution);



module.exports = api