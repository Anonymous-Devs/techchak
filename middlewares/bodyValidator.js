'use strict';

const { INTERNAL_SERVER_ERROR } = require('../utils/http.response.message');
const {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
} = require('../utils/http.response.code');

const ApiResponse = require('../utils/http.response');

const {
  accountSchema,
  changePasswordSchema,
  profileSchema,
  imageSchema,
  projectImageSchema,
  cvSchema,
  cImageSchema,
  adminSignupSchema,
  userSignupSchema,
  projectSchema,
  updateProjectSchema,
  createWikiSchema,
  createVideoSchema,
  updateVideoSchema,
  cc,
  forgotPasswordSchema,
  updateWikiSchema,
  updateAppStatusSchema,
  portfolioProjectStatusSchema,
  resetPasswordSchema,
  supportGroupSchema,
  supportGroupChatSchema,
  testimonySchema,
  upgradeUserSchema,
  joinWaitlist,
} = require('../utils/request.schema');
const validator = require('../utils/validator');

const { ADMIN, SUPERADMIN, FELLOW, BUILDER } = require('../utils/role');

class BodyValidator {
   async u(schema, {
      req,
      res,
      next
   }) {
      try {
         
         const valid = await validator(schema, req.body);
         if (valid.ok) {
            res.locals.validatedBody = valid.data;
            next();
         } else res.status(valid.code).json(valid);
      } catch (err) {
         logger.error(err);

         res.status(HTTP_INTERNAL_SERVER_ERROR).json(ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, err));
      }
   }

   static async signup(req, res, next) {
      
      let schema;
      if ([ADMIN, SUPERADMIN].includes(req.body.type)) {
         schema = adminSignupSchema;
      } else if ([BUILDER, FELLOW].includes(req.body.type)) {
         // generates default password for fellow during application
         req.body.defaultPassword = helper.generateRandomString(10, "hex");
         schema = userSignupSchema;
         logger.info(req.body.email+" default Password is: " + req.body.defaultPassword);
      } else res.status(HTTP_BAD_REQUEST).json(ApiResponse.gen(HTTP_BAD_REQUEST, `The role field is expected to be [${FELLOW}, ${ADMIN}, ${BUILDER} or ${SUPERADMIN}]`));

      if ([ADMIN, SUPERADMIN, FELLOW, BUILDER].includes(req.body.type)) {
         await new BodyValidator().u(schema, {
            req,
            res,
            next
         });
      }
   }

  static async login(req, res, next) {
    await new BodyValidator().u(accountSchema, {
      req,
      res,
      next,
    });
  }

  static async updateAccount(req, res, next) {
    let valid;
    if (
      Object.keys(req.body).includes('email') ||
      Object.keys(req.body).includes('password')
    ) {
      valid = accountSchema;
    } else {
      if (Object.keys(req.body).includes('fullName')) {
        req.body.firstName = req.body.fullName.split(' ')[0];
        req.body.lastName = req.body.fullName.split(' ')[1];
        delete req.body.fullName;
      }
      valid = profileSchema;
    }
    await new BodyValidator().u(valid, {
      req,
      res,
      next,
    });
  }

  static async changePassword(req, res, next) {
    await new BodyValidator().u(changePasswordSchema, {
      req,
      res,
      next,
    });
  }

   static async createProject(req, res, next) {
    if (req.body.tags instanceof Array === false && req.body.tags) {
      req.body.tags = req.body.tags.split(',');
    }
      let schema;
      if(req.query.isDraft == "true") schema = updateProjectSchema
      else schema = projectSchema;
      await new BodyValidator().u(schema, {
         req,
         res,
         next
      });
    }

    static async  updateProject (req, res, next) {
      if (req.body.tags instanceof Array === false && req.body.tags) {
        req.body.tags = req.body.tags.split(',');
      }
      await new BodyValidator().u(updateProjectSchema, {
        req,
        res,
        next
     });
    }

  static async uploadAvatar(req, res, next) {
    await new BodyValidator().u(imageSchema, {
      req,
      res,
      next,
    });
  }

  static async uploadProject(req, res, next) {
    await new BodyValidator().u(projectImageSchema, {
      req,
      res,
      next,
    });
  }

  static async uploadResume(req, res, next) {
    await new BodyValidator().u(cvSchema, {
      req,
      res,
      next,
    });
  }

  static async createVideo(req, res, next) {
    if (req.body.tags instanceof Array === false && req.body.tags) {
      req.body.tags = req.body.tags.split(',');
    }
    await new BodyValidator().u(createVideoSchema, {
      req,
      res,
      next,
    });
  }

  static async validateUpdateWiki(req, res, next) {
    await new BodyValidator().u(updateWikiSchema, {
      req,
      res,
      next,
    });
  }

   static async uploadCover(req, res, next) {
      await new BodyValidator().u(cImageSchema, {
         req,
         res,
         next
      })
   }

   static async c(req, res, next) {
      let schema;
      if(req.query.isDraft == "true") schema = updateWikiSchema
      else schema = createWikiSchema;
      await new BodyValidator().u(schema, {
         req,
         res,
         next
      });
   }

  static async validateUpdateVideo(req, res, next) {
    if (req.body.tags instanceof Array === false && req.body.tags) {
      req.body.tags = req.body.tags.split(',');
    }
    await new BodyValidator().u(updateVideoSchema, {
      req,
      res,
      next,
    });
  }

  static async updateAppStatus(req, res, next) {
    await new BodyValidator().u(updateAppStatusSchema, {
      req,
      res,
      next,
    });
  }

  static async cc(req, res, next) {
    await new BodyValidator().u(cc, {
      req,
      res,
      next,
    });
  }

   static async updatePortfolioProjectStatus(req, res, next) {

      await new BodyValidator().u(portfolioProjectStatusSchema, {
         req,
         res,
         next
      });
   }

   static async forgotPassword(req, res, next) {
      await new BodyValidator().u(forgotPasswordSchema, {
         req,
         res,
         next
      });
   }

   static async resetPassword(req, res, next) {
      await new BodyValidator().u(resetPasswordSchema, {
         req,
         res,
         next
      });
   }

  static async validateCreateVideo(req, res, next) {
    await new BodyValidator().u(createVideoSchema, {
      req,
      res,
      next,
    });
  }

  static async updateSupportGroup(req, res, next) {
    await new BodyValidator().u(supportGroupSchema, {
      req,
      res,
      next,
    });
  }

  static async createSupportGroup(req, res, next) {
    await new BodyValidator().u(supportGroupSchema, {
      req,
      res,
      next,
    });
  }

  static async createGroupChatMessage(req, res, next) {
    await new BodyValidator().u(supportGroupChatSchema, {
      req,
      res,
      next,
    });
  }

  static async testimony(req, res, next) {
    await new BodyValidator().u(testimonySchema, {
      req,
      res,
      next,
    });
  }

  static async upgradeUser (req, res, next) {
    await new BodyValidator().u(upgradeUserSchema, {
      req,
      res,
      next,
    });
  }
 
  static async joinWaitlist (req, res, next) {
    await new BodyValidator().u(joinWaitlist, {
      req,
      res,
      next,
    });
  }
}

module.exports = BodyValidator;
