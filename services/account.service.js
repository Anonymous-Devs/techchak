/*jslint node: true */
// jshint esversion:8

'use strict';
const path = require('path');
const AccountModel = require(path.resolve('modules/account/model'));
const { userProfileModel } = require(path.resolve('modules/profile/model'));
const Platform = require('./platform.service');
const dayjs = require('dayjs');

const {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_CONFLICT,
  HTTP_CREATED,
  HTTP_FORBIDDEN,
} = require('../utils/http.response.code');
const responseMessage = require('../utils/http.response.message');
const MailNotificationService = require(path.resolve(
  'services',
  'mail.notification.service'
));
const ProjectService = require('./project.service');
const PortfolioService = require('./portfolio.service');
const ProfileService = require('./profile.service');

const ApiResponse = require(path.resolve('utils', 'http.response'));

const { ADMIN, SUPERADMIN, FELLOW, BUILDER } = require('../utils/role');

class Account extends AccountModel {
  static async getAccountById(id, filter) {
    try {
      const account = await this.findById(id);
      if (account) {
        const result = filter
          ? helper.filter(account._doc, filter)
          : account._doc;
        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.ACCOUNT_RETRIEVED,
          result
        );
      } else {
        return ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      }
    } catch (err) {
      return ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getAccountByEmail(email, filter) {
    const account = await this.findOne({
      email,
    });
    if (account) {
      const result = filter
        ? helper.filter(account._doc, filter)
        : account._doc;
      return result;
    }
    return null;
  }

  static async createAccount(body) {
    try {
      let { email, password, defaultPassword, type } = body;
      const user = await this.getAccountByEmail(email);
      if (!user) {
        // hash the password
        password = helper.hashPassword(password || defaultPassword);
        const passwordArchived = [helper.encrypt(password || defaultPassword)];
        const data = {
          email,
          password,
          role: type,
          passwordArchived,
        };
        let appStatus;

        if ([ADMIN, SUPERADMIN].includes(type) === false) {
          // get the platform settings
          let platform = await Platform.getPlatformSettings();
          platform = platform.data;

          if (platform.automate_app_acceptance) {
            appStatus = 'accepted';
            data.isEnabled = true;
          } else if (platform.automate_app_rejection) {
            appStatus = 'rejected';
            data.isEnabled = false;
          } else {
            appStatus = 'pending';
            data.isEnabled = false;
          }

          data.applicationStatus = appStatus;
          let encryptedPassword = helper.encrypt(defaultPassword);

          data.defaultPassword = encryptedPassword;
        } else data.isEnabled = true;
        const account = await this.create(data);

        // setup profile
        const profile = await ProfileService.setUpProfile(account._id, body);

        if ([BUILDER, FELLOW].includes(type)) {
          body.level = body.experienceLevel;
          body.type = 'personal';
          profile.role = account.role;
          // get 10 projects according to the users experince level, department and area
          const roadMapProjects = await ProjectService.getRoadMapProjects(
            body,
            profile
          );
          // set up portfolio
          await PortfolioService.setUpPortfolio(
            profile._id,
            roadMapProjects.data
          );
          // send notification
          // await MailNotificationService.sendApplicationNotification({
          //   to: email,
          //   name: profile.firstName,
          // });
          await MailNotificationService.sendAutomatedAcceptanceMail({
            to: email,
            name: profile.firstName,
          });
          if (appStatus !== 'pending') {
            await MailNotificationService.sendAppStatusEmail({
              to: email,
              name: profile.firstName,
              status: appStatus,
              defaultPassword,
            });
            // if (appStatus === 'accepted') await MailNotificationService.sendVerificationEmail({
            //   to: email,
            //   name: profile.firstName,
            // });
          }
        } else {
          // send notification
          await MailNotificationService.sendVerificationEmail({
            to: email,
            name: profile.firstName,
          });

          // set up portfolio
          await PortfolioService.setUpPortfolio(profile._id);
        }

        return ApiResponse.gen(HTTP_CREATED, responseMessage.ACCOUNT_CREATED);
      } else {
        throw ApiResponse.gen(
          HTTP_CONFLICT,
          responseMessage.ACCOUNT_ALREADY_EXISTS
        );
      }
    } catch (err) {
      logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR,
        err
      );
    }
  }

  static async login({ email, password }, referrer) {
    try {
      let user = await this.getAccountByEmail(email);
      if (user) {
        if ([BUILDER, FELLOW].includes(user.role) && referrer == ADMIN) {
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ONLY_ADMINS_ACCESS
          );
        } else if (
          [ADMIN, SUPERADMIN].includes(user.role) &&
          referrer == FELLOW
        ) {
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ONLY_FELLOWS_ACCESS
          );
        }
        // reject pending application login attempt
        if (
          [BUILDER, FELLOW].includes(user.role) &&
          user.applicationStatus === 'pending'
        )
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ACCOUNT_PENDING
          );
        else if (
          [BUILDER, FELLOW].includes(user.role) &&
          user.applicationStatus === 'rejected'
        )
          throw ApiResponse.gen(
            HTTP_FORBIDDEN,
            responseMessage.ACCOUNT_DECLINED_ERROR
          );

        // reject disabled user login attempt
        if (user.isEnabled === false)
          throw ApiResponse.gen(HTTP_FORBIDDEN, responseMessage.NOT_ENABLED);

        const passwordMatches = helper.comparePassword(user.password, password);

        if (passwordMatches) {
          let profile = await ProfileService.getProfileByAccountId({
              user: user._id,
            }),
            pid = profile._id;

          const token = helper.generateUserToken(user._id, user.role, pid);
          logger.info(`${user.email} logged in successfully`);

          // update last login
          await this.findByIdAndUpdate(user._id, {
            lastLogin: dayjs(new Date()).format('YYYY-MM-DD HH:mm'),
          });

          return ApiResponse.gen(
            HTTP_OK,
            responseMessage.ACCOUNT_LOGGED_IN,
            token
          );
        }

        throw ApiResponse.gen(
          HTTP_BAD_REQUEST,
          responseMessage.PASSWORD_INCORRECT
        );
      }
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND);
    } catch (err) {
      logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async toggleUserApproval(id) {
    try {
      let enabled, disabled;
      const user = await this.findById(id);
      if (!user) {
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      }
      const { firstName } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'firstName',
      });

      if (user.isEnabled) {
        disabled = await this.findByIdAndUpdate(id, {
          isEnabled: false,
        });
        if (disabled) {
          delete disabled._doc.password;
          delete disabled._doc.passwordArchived;

          await MailNotificationService.sendSuspensionMail({
            to: user.email,
            name: firstName,
          });
          return ApiResponse.gen(
            HTTP_OK,
            responseMessage.ACCOUNT_DISABLED,
            disabled
          );
        } else
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.ACCOUNT_DISABLED_FAILED
          );
      } else {
        enabled = await this.findByIdAndUpdate(id, {
          isEnabled: true,
        });
        if (enabled) {
          delete enabled._doc.password;
          delete enabled._doc.passwordArchived;

          await MailNotificationService.sendSuspensionRevokedMail({
            to: enabled.email,
            role: enabled.role,
            name: firstName,
          });
          return ApiResponse.gen(
            HTTP_OK,
            responseMessage.ACCOUNT_ENABLED,
            enabled
          );
        } else
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.ACCOUNT_ENABLED_FAILED
          );
      }
    } catch (err) {
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async updateApplicationStatus(id, status) {
    try {
      const user = await this.findById(id);
      const { firstName } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'firstName',
      });
      if (!user)
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.APPLICATION_NOT_FOUND
        );

      let updated = await this.findByIdAndUpdate(id, {
        applicationStatus: status,
        isEnabled: status.toLowerCase() === 'accepted' ? true : false,
      });

      if (updated) {
        // send application update email
        await MailNotificationService.sendAppStatusEmail({
          to: user.email,
          name: firstName,
          status: updated.applicationStatus,
          defaultPassword: helper.decrypt(updated.defaultPassword),
        });
        if (updated.applicationStatus === 'accepted') {
          // send account verification email
          await MailNotificationService.sendVerificationEmail({
            to: user.email,
            name: firstName,
          });
        }

        delete updated._doc.password;
        delete updated._doc.passwordArchived;

        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.APPLICATION_STATUS_UPDATED,
          updated
        );
      } else
        throw ApiResponse.gen(
          HTTP_INTERNAL_SERVER_ERROR,
          responseMessage.APPLICATION_STATUS_UPDATED_FAILED
        );
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      return ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async updateUserChatStatus(id, onlineChatStatus) {
    try {
      await this.findByIdAndUpdate(id, {
        onlineChatStatus: onlineChatStatus,
      });

      return ApiResponse.gen(HTTP_OK, responseMessage.ACCOUNT_UPDATED, {});
    } catch (err) {
      logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async deleteAccount(id) {
    try {
      const account = await this.findByIdAndDelete(id);
      const { firstName } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'firstName',
      });
      if (account) {
        // send notification
        await MailNotificationService.sendAccountDeletedEmail({
          to: account.email,
          name: firstName,
        });
        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.ACCOUNT_DELETED,
          account
        );
      } else {
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      }
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async resendVerificationEmail(id, pid) {
    try {
      const { data } = await this.getAccountById(id);
      const { firstName } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'firstName',
      });
      if (data) {
        // send notification
        await MailNotificationService.sendVerificationEmail({
          to: data.email,
          name: firstName,
        });

        return ApiResponse.gen(
          HTTP_OK,
          responseMessage.VERIFICATION_EMAIL_SENT
        );
      }
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND);
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async verifyAccount(secure) {
    try {
      const token = helper.decrypt(secure);
      const user = helper.verifyToken(token);

      if (user === 'token_expired' || user === 'invalid signature') {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.LINK_EXPIRED);
      }

      if (user === 'token_expired' || user === 'invalid signature') {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.LINK_EXPIRED);
      }

      if (token) {
        const account = await this.getAccountByEmail(user.email);

        if (account) {
          if (account.status == 'active') {
            throw ApiResponse.gen(
              HTTP_BAD_REQUEST,
              responseMessage.ACCOUNT_ALREADY_VERIFIED
            );
          } else {
            account.status = 'active';
            await this.findByIdAndUpdate(account._id, account);
            return ApiResponse.gen(HTTP_OK, responseMessage.ACCOUNT_VERIFIED);
          }
        }
        throw ApiResponse.gen(
          HTTP_NOT_FOUND,
          responseMessage.ACCOUNT_NOT_FOUND
        );
      } else
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.INVALID_TOKEN);
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async changePassword(id, data) {
    try {
      const account = await this.findById(id);
      const { firstName } = await ProfileService.getProfileByAccountId({
        user: id,
        filter: 'firstName',
      });

      const passwordMatches = helper.comparePassword(
        account.password,
        data.oldPassword
      );
      // ensures that the provided password matches the database password
      if (!passwordMatches) {
        const msg = `Old ${responseMessage.PASSWORD_INCORRECT.toLowerCase()}`;
        throw ApiResponse.gen(HTTP_BAD_REQUEST, msg);
      }

      // ensures that the new password is not one of the old passwords
      let isUsedPassword = false;
      for (let archivedPassword of account.passwordArchived) {
        if (helper.decrypt(archivedPassword) == data.password)
          isUsedPassword = true;
      }
      if (isUsedPassword) {
        throw ApiResponse.gen(
          HTTP_BAD_REQUEST,
          responseMessage.PASSWORD_ALREADY_USED
        );
      }
      // change the password if provided password matches the database password and new password has not been used before
      else if (passwordMatches && !isUsedPassword) {
        const passwordArchived = [
          ...account.passwordArchived,
          helper.encrypt(data.oldPassword),
        ];
        const password = helper.hashPassword(data.password);
        const result = await this.findByIdAndUpdate(id, {
          password,
          passwordArchived,
        });
        if (result) {
          if (account.defaultPassword) {
            await this.findByIdAndUpdate(id, {
              defaultPassword: null,
            });
          }
          // send notification
          await MailNotificationService.sendChangedPasswordEmail({
            to: account.email,
            role: account.role,
            name: firstName,
          });

          return ApiResponse.gen(HTTP_OK, responseMessage.PASSWORD_CHANGED);
        } else {
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.PASSWORD_CHANGED_FAILED
          );
        }
      }
    } catch (err) {
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async forgotPassword(email) {
    const user = await this.findOne({
      email,
    });
    if (!user) {
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.ACCOUNT_NOT_FOUND);
    }
    const { firstName } = await ProfileService.getProfileByAccountId({
      user: user._id,
      filter: 'firstName',
    });
    await MailNotificationService.sendResetPasswordMail({
      to: email,
      role: user.role,
      name: firstName,
    });

    return ApiResponse.gen(HTTP_OK, responseMessage.FORGOT_PASSWORD);
  }

  static async resetPassword(data) {
    try {
      const token = helper.decrypt(data.secure);
      const user = helper.verifyToken(token);

      if (user === 'token_expired' || user === 'invalid signature') {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.LINK_EXPIRED);
      }
      if (token) {
        const account = await this.getAccountByEmail(user.email);
        if (account) {
          for (let encryptedPassword of account.passwordArchived) {
            if (helper.decrypt(encryptedPassword) == data.password) {
              throw ApiResponse.gen(
                HTTP_FORBIDDEN,
                responseMessage.PASSWORD_ALREADY_USED
              );
            }
          }
          const password = helper.hashPassword(data.password);
          const passwordArchived = [
            ...account.passwordArchived,
            helper.encrypt(data.password),
          ];

          const result = await this.findByIdAndUpdate(account._id, {
            password,
            passwordArchived,
          });

          if (result) {
            return ApiResponse.gen(HTTP_OK, responseMessage.PASSWORD_RESET);
          }
          throw ApiResponse.gen(
            HTTP_INTERNAL_SERVER_ERROR,
            responseMessage.PASSWORD_RESET_FAILED
          );
        }
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, responseMessage.INVALID_TOKEN);
      }
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getAllUsers(data) {
    let {
      applicationStatus,
      isEnabled,
      type,
      department,
      area,
      email,
      createdAt,
    } = data;

    data.limit = parseInt(data.limit) || Infinity;
    data.skip = parseInt(data.skip) > 0 ? parseInt(data.skip) - 1 : 0;
    isEnabled = isEnabled === 'false' ? false : true;
    try {
      let filter = {
        isEnabled,
        applicationStatus,
        role: type,
        department,
        area,
        email,
        createdAt,
      };

      if (!applicationStatus) delete filter.applicationStatus;
      if (!isEnabled) delete filter.isEnabled;
      if (!type) delete filter.role;
      if (!department) delete filter.department;
      if (!area) delete filter.area;
      if (!email) delete filter.email;
      if (!createdAt) delete filter.createdAt;

      if (createdAt) {
        // filter.role = type || FELLOW;

        const date = new Date();
        date.setHours(0, 0, 0, 0);
        filter.createdAt = {
          $gte: dayjs(date)
            .subtract(createdAt || 7, 'day')
            .toISOString(),
        };
      }
      if ([ADMIN, SUPERADMIN].includes(filter.role)) {
        delete filter.applicationStatus;
      }

      let users = await AccountModel.find(filter)
        .skip(data.skip * data.limit)
        .limit(data.limit)
        .sort({
          createdAt: -1,
        });

      let userIds = users.map((user) => user._id);

      users = await userProfileModel
        .find(filter)
        .where('user')
        .in(userIds)
        .populate('user')
        .sort({
          createdAt: -1,
        })
        .exec();

      filter.skip = data.skip;
      filter.limit = data.limit;
      const pageCount = await this.countDocuments(filter);

      data = {
        data: users,
        totalPages: Math.ceil(pageCount / data.limit) || 1,
        page: parseInt(data.skip) + 1,
        perPage: parseInt(data.limit) || pageCount,
        pageCount: users.length,
      };
      return ApiResponse.gen(HTTP_OK, 'Retrieved successfully', data);
    } catch (err) {
      // logger.error(err);
      if (err.code) throw err;
      throw ApiResponse.gen(HTTP_NOT_FOUND, responseMessage.PROFILE_NOT_FOUND);
    }
  }

  static async getActiveUsers(obj) {
    try {
      obj.skip = obj.offset || 0;

      const filt = {
        applicationStatus: 'accepted',
        isEnabled: true,
        role: {
          $nin: [SUPERADMIN, ADMIN],
        },
      };

      if ([ADMIN, SUPERADMIN].includes(filt.role))
        delete filt.applicationStatus;

      const filter = {
        lastLogin: {
          $gte: dayjs(new Date())
            .subtract(obj.for || 3, 'day')
            .format('YYYY-MM-DD'),
        },
        ...filt,
      };

      const aggregation = [
        {
          $lookup: {
            from: 'profiles',
            localField: '_id',
            foreignField: 'user',
            as: 'profile',
          },
        },
      ];

      obj.limit = parseInt(obj.limit) || Infinity;
      obj.skip = parseInt(obj.skip) > 0 ? parseInt(obj.skip) - 1 : 0;

      let users = await this.aggregate(aggregation)
        .match(filter)
        .skip(obj.skip * obj.limit)
        .limit(obj.limit)
        .sort({
          lastLogin: -1,
        });

      users = users.map((user) => {
        delete user.password;
        delete user.passwordArchived;
        delete user.defaultPassword;
        return user;
      });
      const pageCount = await this.countDocuments(filter);
      const data = {
        data: users,
        totalPages: Math.ceil(pageCount / obj.limit) || 1,
        page: parseInt(obj.skip) + 1,
        perPage: parseInt(obj.limit) || pageCount,
        pageCount: users.length,
      };

      return ApiResponse.gen(HTTP_OK, 'Retrieved successfully', data);
    } catch (e) {
      throw ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async upgradeUser(id, { type }) {
    const user = await this.findByIdAndUpdate(id, {
      role: type,
    });
    if (user) {
      return ApiResponse.gen(HTTP_OK, 'User upgraded successfully');
    } else {
      throw ApiResponse.gen(HTTP_NOT_FOUND, 'Failed to upgrade user');
    }
  }
}

module.exports = Account;
