const BodyValidator = require('../../middlewares/bodyValidator');

const route = require('express').Router(),
 controller = require('../../controllers/testimonial'),
 {
  validateAuthorization,
  validateSuperAdmin,
  validateUserAvailability,
  validateAdmin
 } = require('../../middlewares');

route.post('/', validateAuthorization, validateUserAvailability, (req, res, next)=>{
 if(['admin', 'superAdmin'].includes(res.locals.user.role)){
  res.status(403).json({code: 403, message: 'Error: only users can create testimonial'});
 } else next();
}, BodyValidator.testimony, controller.create)
route.get('/all', controller.getMany)
route.get('/:id', controller.getOne)
route.put('/:id', validateAuthorization, validateUserAvailability, validateAdmin, BodyValidator.testimony, controller.update)
route.delete('/:id', validateAuthorization, validateUserAvailability, validateSuperAdmin, controller.delete)


module.exports = route;