const controller = require('../../controllers/video'),
 router = require('express').Router(),
 {
  validateAuthorization,
  validateUserAvailability,
  validateAdmin,
  validateSuperAdmin,
  validateUserAndSuperAdmin
 } = require("../../middlewares"),
 BodyValidator = require('../../middlewares/bodyValidator');


/* VIDEO ROUTE */
 
 router.post("/", validateAuthorization, validateUserAvailability, validateAdmin, BodyValidator.createVideo, controller.createVideo);

 router.put("/:id", validateAuthorization, validateUserAvailability, validateAdmin, BodyValidator.validateUpdateVideo, controller.updateVideo);

 router.get("/all", validateAuthorization, validateUserAvailability, controller.j);

 router.get("/:id", validateAuthorization, validateUserAvailability, controller.findById);

 router.delete("/:id", validateAuthorization, validateUserAvailability, validateSuperAdmin, controller.deleteVideo);

 router.post('/:videoId/like', validateAuthorization, validateUserAvailability, controller.likeVideo);

 router.post('/:id/comment', validateAuthorization, validateUserAvailability, BodyValidator.cc, controller.cc);
 

module.exports = router