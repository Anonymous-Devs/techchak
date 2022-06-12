const handler = require('../../controllers/waitlist');
const route = require('express').Router();
const BodyValidator = require('../../middlewares/bodyValidator');

route.post('/', BodyValidator.joinWaitlist, handler.c);
route.get('/', handler.w);
route.get('/:o', handler.n);

module.exports = route;