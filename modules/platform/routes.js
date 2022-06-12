// const BodyValidator = require('../../middlewares/bodyValidator');

const route = require('express').Router(),
 handler = require('./handler'),
 {
  validateAuthorization,
  validateSuperAdmin,
  validateUserAvailability,
  validateAdmin
 } = require('../../middlewares');

route.get('/settings', validateAuthorization, validateSuperAdmin, validateUserAvailability, handler.getPlatformSetting);

route.put('/settings', validateAuthorization, validateSuperAdmin, validateUserAvailability, handler.updatePlatformSetting);

route.get('/skillsets', handler.getSkillsets)
route.get('/certifications', handler.getCertifications)
route.post('/certifications', validateAuthorization, validateUserAvailability, validateAdmin, handler.createCertifications)
route.get('/departments', handler.getDepartments)
route.get('/areas', handler.getAreas)
route.get('/resources', handler.GetRESOURCES)
route.patch('/upload-file', handler.g)
module.exports = route;