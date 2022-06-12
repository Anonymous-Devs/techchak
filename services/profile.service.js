'use strict';
const path = require('path');
const { userProfileModel } = require('../modules/profile/model');
const { SUPERADMIN, ADMIN, FELLOW, BUILDER } = require('../utils/role');

const responseCode = require(path.resolve('utils', 'http.response.code'));
const responseMessage = require(path.resolve('utils', 'http.response.message'));
const ApiResponse = require(path.resolve(
  path.resolve('utils', 'http.response')
));

class Profile extends userProfileModel {
  /**
   * @description Setup user profile by the user id
   * @param {string} user - The user id
   * @param {string} role - The role of the user
   * @returns {object} The user profile
   */
  static async setUpProfile(user, body) {
    if ([ADMIN, SUPERADMIN].includes(body.type)) {
      const name = body.fullName.split(' ');
      body.firstName = name[0];
      body.lastName = name[1];

      delete body.fullName;
    }

    const profile = this,
      createdProfile = await profile.create({
        user,
        ...body,
      });
    return createdProfile;
  }

  /**
   * @description Get user profile by the user id
   * @param {object} obj - The option object
   * @param {string} obj.user - The user id
   * @param {string} obj.role - The role of the user
   * @param {array} obj.filter - The filter to be applied
   * @returns {object} The user profile
   */
  static async getProfileByAccountId({ user, filter }) {
    try {
      const profile = await this.findOne({
        user,
      }).populate('user');

      if (profile) {
        const result = filter
          ? helper.filter(profile._doc, filter)
          : profile._doc;
        return result;
      }
      return null;
    } catch (error) {
      return ApiResponse.gen(
        responseCode.HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }

  /**
   * @description Updates user profile by the user id
   * @param {string} user - The user id
   * @param {object} data - The data to be updated
   * @returns {object} The updated user profile
   */
  static async updateProfileById(user, data) {
    if (data) {
      let profile;
      if ([BUILDER, FELLOW].includes(user.role)) {
        profile = await this.findOneAndUpdate(
          {
            user: user.id,
          },
          {
            $set: data,
          }
        );
      } else if ([SUPERADMIN, ADMIN].includes(user.role)) {
        profile = await this.findOneAndUpdate(
          {
            user: user.id,
          },
          {
            $set: data,
          }
        );
      }

      if (profile)
        return ApiResponse.gen(
          responseCode.HTTP_OK,
          responseMessage.PROFILE_UPDATED,
          profile
        );
      throw ApiResponse.gen(
        responseCode.HTTP_INTERNAL_SERVER_ERROR,
        responseMessage.PROFILE_UPDATED_FAILED,
        profile
      );
    } else {
      throw ApiResponse.gen(
        responseCode.HTTP_BAD_REQUEST,
        responseMessage.PROFILE_UPDATED_FAILED,
        data
      );
    }
  }

  /**
   * @description Deletes user profile by id
   * @param {string} id - The user by their profile id
   * @returns {object} The deleted user profile
   */
  static async deleteByOwner(id) {
    if (await this.findOne(id)) {
      const profile = await this.findByIdAndDelete(id);
      if (profile)
        return { name: 'Profile', acknowledged: true, deletedCount: 1 };
      else return { name: 'Profile', acknowledged: false, deletedCount: 0 };
    } else {
      throw ApiResponse.gen(
        responseCode.HTTP_NOT_FOUND,
        responseMessage.PROFILE_NOT_FOUND
      );
    }
  }

  /**
   * @description Updates user profile image by the user id
   * @param {string} id - The user id
   * @param {string} imageUrl - The user image link
   * @returns {object} The users rofile
   */

  static async updateAvatar(id, imageUrl) {
    const updated = await this.findOneAndUpdate(
      { user: id },
      {
        avatar: imageUrl,
      }
    );
    if (updated) {
      return ApiResponse.gen(
        responseCode.HTTP_CREATED,
        'Profile image uploded successfully',
        updated
      );
    } else {
      throw ApiResponse.gen(
        responseCode.HTTP_INTERNAL_SERVER_ERROR,
        'Failed to uplaod profile image'
      );
    }
  }

  /**
   * @description Updates user profile cv by the user id
   * @param {string} id - The user id
   * @param {string} imageUrl - The user image link
   * @returns {object} The users rofile
   */

  static async updateCv(id, cvUrl) {
    const updated = await this.findOneAndUpdate(
      { user: id },
      {
        resume: cvUrl,
      }
    );
    if (updated) {
      return ApiResponse.gen(
        responseCode.HTTP_CREATED,
        'user resume uploaded successfully',
        updated
      );
    } else {
      throw ApiResponse.gen(
        responseCode.HTTP_INTERNAL_SERVER_ERROR,
        'Failed to upload user resume'
      );
    }
  }

  static async updateCoverImage(id, cImageUrl) {
    const updated = await this.findOneAndUpdate(
      { user: id },
      {
        coverImage: cImageUrl,
      }
    );
    if (updated) {
      return ApiResponse.gen(
        responseCode.HTTP_CREATED,
        'user cover image updated successfully',
        updated
      );
    } else {
      throw ApiResponse.gen(
        responseCode.HTTP_INTERNAL_SERVER_ERROR,
        'Failed to upload user cover image'
      );
    }
  }
}

module.exports = Profile;
