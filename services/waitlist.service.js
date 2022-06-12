const M = require('../modules/waitlist/model');
const {
  WAITLIST_CREATED,
  WAITLIST_RETRIEVED,
  SOMETHING_WENT_WRONG,
  INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND,
} = require('../utils/http.response.message');
const {
  HTTP_CREATED,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_CONFLICT
} = require('../utils/http.response.code');
const Response = require('../utils/http.response');
const MailNotification = require('./mail.notification.service');

module.exports = class extends M {
  static c = "estimatedDocumentCount"

  static async t(l) {
    const o = this;
    try {
      const i = await o.create(l.o);
      if (i) {
        await MailNotification.sendWaitlistMessage({
          to: l.o.email,
          name: l.o.fullName.trim().split(' ')[0]
        });

        const d = await o[this.c]();
        return Response.gen(HTTP_CREATED, WAITLIST_CREATED, {
          position: d
        });
      } else {
        throw Response.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG)
      }
    } catch (err) {
      logger.error(err.message);
      if (err.code === 11000) {
        let i = Array.from(await o.find().lean()).findIndex(a => a.email == l.o.email);
        throw Response.gen(HTTP_CONFLICT, "Hello there, You are already in the waitlist.", {
          position: i + 1
        })
      } else if (err.code) throw err;
      else {
        logger.error(err);
        throw Response.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, err)
      }
    }
  }

  static async gt() {
    const o = this;
    try {
      const y = await o.find();
      return Response.gen(HTTP_OK, WAITLIST_RETRIEVED, y)
    } catch (f) {
      if (f.code) throw f;
      else {
        logger.error(f)
        throw Response.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, f)
      }
    }
  }

  static async s(z) {
    const o = this;
    try {

      let p = await o.findById(z.i);
      if (p) {
        return Response.gen(HTTP_OK, WAITLIST_RETRIEVED, p)
      } else {
        throw Response.gen(HTTP_NOT_FOUND, USER_NOT_FOUND)
      }
    } catch (err) {
      if (err.code) throw err;
      else {
        logger.error(err);
        throw Response.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, err)
      }
    }
  }

}