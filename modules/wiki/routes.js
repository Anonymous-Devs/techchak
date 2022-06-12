const z = require('../../controllers/wiki'),
router = require('express').Router(),
 {
  validateAuthorization,
  validateUserAvailability,
  validateSuperAdmin,
  validateUserAndSuperAdmin,
  validateAdmin
 } = require("../../middlewares"),
 BodyValidator = require('../../middlewares/bodyValidator');

/* WIKI ROUTE */

 router.post("/", validateAuthorization, validateUserAvailability, BodyValidator.c, z.c);

 router.put("/:id", validateAuthorization, validateUserAvailability, BodyValidator.validateUpdateWiki, z.v);

 router.get("/all", validateAuthorization, validateUserAvailability, z.j);
 
 router.get("/:id", z.h);

 router.delete("/:id", validateAuthorization, validateUserAvailability, validateSuperAdmin, z.d);

 router.post('/:id/comment', validateAuthorization, validateUserAvailability, BodyValidator.cc, z.t);

 router.post('/:id/like', validateAuthorization, validateUserAvailability, z.k);

 router.patch('/:id/approve', validateAuthorization, validateUserAvailability, validateAdmin, z.ac);

 module.exports = router