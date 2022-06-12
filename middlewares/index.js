"use strict";
const accountModel = require("../modules/account/model");
const {
   UNAUTHORIZED,
   NO_TOKEN,
   ACCOUNT_NOT_FOUND,
   ACCESS_DENIED,
   NOT_ENABLED
} = require("../utils/http.response.message");
const {
   HTTP_UNAUTHORIZED,
   HTTP_BAD_REQUEST,
   HTTP_FORBIDDEN,
   HTTP_NOT_FOUND
} = require("../utils/http.response.code");

const ApiResponse = require("../utils/http.response"),
   config = require("../configs/config");

const {
   ADMIN,
   SUPERADMIN,
   BUILDER,
   FELLOW
} = require('../utils/role');
const logger = require("../logger");

exports.attachOriginHostToQuery = (req, res, next) => {
   const host = `${req.protocol}://${req.hostname}`;
   if(!req.headers["Referrer-Policy"]) req.headers["Referrer-Policy"] = "origin";
   if(!req.headers.referer) req.headers.referer = host;
   next();
}

exports.validateAuthorization = (req, res, next) => {
   try {
      const token = req.headers.authorization;
      if (token.trim()) {
         const isVerified = helper.verifyToken(token);
         if (isVerified === "token_expired" || isVerified === "invalid signature") {
            const data = ApiResponse.gen(HTTP_UNAUTHORIZED, UNAUTHORIZED);
            return res.status(data.code).json(data);
         } else {
            res.locals.user = isVerified;
            next();
         }
      } else {
         const data = ApiResponse.gen(HTTP_UNAUTHORIZED, NO_TOKEN);
         return res.status(data.code).json(data);
      }
   } catch (err) {
      const data = ApiResponse.gen(HTTP_UNAUTHORIZED, "Bad Token");
      return res.status(data.code).json(data);
   }
};

exports.validateUserAvailability = async (req, res, next) => {
   try {
      const {
         id
      } = res.locals.user;
      const user = await accountModel.findById(id);

      if (user) {

         if (user.isEnabled === false) res.status(HTTP_FORBIDDEN).json(ApiResponse.gen(HTTP_FORBIDDEN, NOT_ENABLED));
         else next();
      } else {
         const data = ApiResponse.gen(HTTP_NOT_FOUND, ACCOUNT_NOT_FOUND);
         logger.error(data)
         return res.status(data.code).json(data);
      }
   } catch (err) {
      logger.error(err)
      res.status(400).json(ApiResponse.gen(HTTP_BAD_REQUEST, err.message));
   }
};

exports.validateAdmin = async (req, res, next) => {
   const {
      role
   } = res.locals.user;
   // Check if role is user
   if ([ADMIN, SUPERADMIN].includes(role)) {
      next();
      // Deny access to the route
   } else {
      const data = ApiResponse.gen(HTTP_FORBIDDEN, ACCESS_DENIED);
      logger.error(data)
      return res.status(data.code).json(data);
   }

};

exports.validateSuperAdmin = async (req, res, next) => {
   const {
      role
   } = res.locals.user;
   // Check if role is user
   if (SUPERADMIN === role) {
      next();
      // Deny access to the route
   } else {
      const data = ApiResponse.gen(HTTP_FORBIDDEN, "Access denied! Only super admin can perform this action.");
      logger.error(data)
      return res.status(data.code).json(data);
   }

};

exports.validateUserAndSuperAdmin = async (req, res, next) => {
   const {
      role
   } = res.locals.user;
   // Check if role is user
   if ([SUPERADMIN, FELLOW, BUILDER].includes(role)) {
      next();
      // Deny access to the route
   } else {
      const data = ApiResponse.gen(HTTP_FORBIDDEN, "Access denied! Only super admin and user can perform this action.");
      logger.error(data)
      return res.status(data.code).json(data);
   }

};

exports.validateBuilderAndAdmin = async (req, res, next) => {
   const {
      role
   } = res.locals.user;
   // Check if role is user
   if ([SUPERADMIN, ADMIN, BUILDER].includes(role)) {
      next();
      // Deny access to the route
   } else {
      const data = ApiResponse.gen(HTTP_FORBIDDEN, "Access denied! Only admins and techchak builders can perform this action.");
      logger.error(data)
      return res.status(data.code).json(data);
   }

};


exports.validateOAuthFlow = async (req, res, next) => {
   const {
      state,
      error
   } = req.query;
   if (error === "user_cancelled_login") {
      const data = ApiResponse.gen(HTTP_UNAUTHORIZED, "Authorization failed: You must log into your linkedin account to perform this action.");
      logger.error(data)
      return res.status(data.code).json(data);
   }

   if (error === "user_cancelled_authorize") {
      const data = ApiResponse.gen(HTTP_UNAUTHORIZED, "Authentication failed: You must grant the required permission to perform this action.");
      logger.error(data)
      return res.status(data.code).json(data);
   }

   if (state != config.secret) {
      const data = ApiResponse.gen(HTTP_UNAUTHORIZED, "Error! The request URL has been manipulated, please try again.");
      logger.error(data)
      return res.status(data.code).json(data);
   }

   next();
}