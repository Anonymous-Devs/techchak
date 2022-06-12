const {
 Settings
} = require('../modules/platform/model');
const dayjs = require('dayjs'),
 {
  SETTINGS_UPDATED,
  SETTINGS_UPDATED_FAILED,
  SETTINGS_NOT_FOUND,
  SETTINGS_RETRIEVED,
  SETTINGS_RETRIEVED_FAILED,
  CANT_ACCEPT_AND_REJECT_AUTOMATION_AT_THE_SAME_TIME,
  TESTIMONY_CREATED,
  TESTIMONY_CREATED_FAILED,
  TESTIMONY_UPDATED,
  TESTIMONY_UPDATED_FAILED,
  TESTIMONY_DELETED,
  TESTIMONY_DELETED_FAILED,
  TESTIMONIES_RETRIEVED,
  TESTIMONY_NOT_FOUND,
  TESTIMONY_RETRIEVED,
  TESTIMONY_RETRIEVED_FAILED,
  INTERNAL_SERVER_ERROR
 } = require('../utils/http.response.message'),
 ApiResponse = require('../utils/http.response'),
 {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_NOT_FOUND,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_CREATED
 } = require('../utils/http.response.code');

const ProjectService = require('./project.service');
const {
 W,
 VideoService
} = require('./wikiAndVideo.service'),
 s3FileUpload = require('../utils/file_upload/s3UploadAdapt');


class PlatformService extends Settings {
 constructor() {
  super();
 }

 static async getPlatformSettings() {
  try {
   const platformSettings = await this.find();
   if (platformSettings.length === 0) {
    throw ApiResponse.gen(HTTP_NOT_FOUND, SETTINGS_NOT_FOUND);
   }
   return ApiResponse.gen(HTTP_OK, SETTINGS_RETRIEVED, platformSettings[0]);
  } catch (error) {
   if (error.code) throw error
   throw ApiResponse.gen(HTTP_BAD_REQUEST, SETTINGS_RETRIEVED_FAILED, error);
  }
 }
 static async updatePlatformSettings(data) {
  try {
   const platformSettings = await this.findOne();


   if (!platformSettings) {
    throw ApiResponse.gen(HTTP_NOT_FOUND, SETTINGS_NOT_FOUND);
   }


   const id = platformSettings._id;

   if (data.automate_app_acceptance) {

    data.automate_app_acceptance_days = dayjs().add(parseInt(data.automate_app_acceptance_days) || 1, 'day').format('YYYY-MM-DD');
   } else if (data.automate_app_rejection) {

    data.automate_app_rejection_days = dayjs().add(parseInt(data.automate_app_rejection_days) || 1, 'day').format('YYYY-MM-DD');
   }

   if (data.automate_app_acceptance && data.automate_app_rejection) {
    throw ApiResponse.gen(HTTP_BAD_REQUEST, CANT_ACCEPT_AND_REJECT_AUTOMATION_AT_THE_SAME_TIME);
   }

   const updatedPlatformSettings = await this.findByIdAndUpdate(id, {
    $set: data
   });

   return ApiResponse.gen(HTTP_OK, SETTINGS_UPDATED, updatedPlatformSettings);
  } catch (error) {
   logger.error(error);
   if (error.code) throw error
   throw ApiResponse.gen(HTTP_BAD_REQUEST, SETTINGS_UPDATED_FAILED, error);
  }
 }


 /**
  * @description: Monitor the platform automation settings for application and update the settings if the date is reached
  * @param {number} hours - hours in milliseconds
  * @return {Promise<void>}
  */
 static mornitorAutomation(hours = 1) {
  hours = 1000 * 60 * 60 * hours || 1;
  logger.info('Platform automation watcher is running');
  logger.info(`This watcher will run every ${hours/3.6e+6} hour`);

  let currentDate, platformData, platform;

  setInterval(async () => {
   currentDate = dayjs().format('YYYY-MM-DD');

   platformData = await this.getPlatformSettings();

   platform = platformData.data;

   let acceptanceDate = platform.automate_app_acceptance_days,

    rejectionDate = platform.automate_app_rejection_days;

   if (platform.automate_app_acceptance) {
    if (acceptanceDate) {
     if (currentDate >= acceptanceDate) {
      platformData = await this.updatePlatformSettings({
       automate_app_acceptance: false
      });

      logger.info(`Platform acceptance automation has been disabled.`, platformData.data.automate_app_acceptance);
     }
    }
   } else if (platform.automate_app_rejection) {
    if (rejectionDate) {
     if (currentDate >= rejectionDate) {
      platformData = await this.updatePlatformSettings({
       automate_app_rejection: false
      });

      logger.info(`Platform rejection automation has been disabled.`, platformData.data.automate_app_rejection);
     }
    }
   } else logger.info(`Platform acceptance and rejection automation has been disabled.`);

  }, hours);
 }

 static async GetRESOURCES({
  limit,
  offset
 }) {
  try {
   const skip = offset;
   const type = {
    $nin: ['solution']
   }
   const wikis = await W.a({
    limit,
    skip,
    isApproved: true,
    isDraft: false,
    type
   }, {});
   const videos = await VideoService.findAllVideos({
    limit,
    skip,
    isVisible: true
   }, {});
   const projects = await ProjectService.getAllProjects({
    limit,
    skip,
    isVisible: true,
    isDraft: false
   }, {});

   const data = {
    wikis: wikis.data.data,
    videos: videos.data.data,
    projects: projects.data
   }

   return ApiResponse.gen(HTTP_OK, 'Resources retrieved successfully', data);
  } catch (error) {
   logger.error(error);
   if (error.code) throw error;
   throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, 'Error while retrieving resources', );
  }
 }

 static async u(i) {
  try {
   const p = await s3FileUpload(i.f, 'files');
   return ApiResponse.gen(HTTP_CREATED, 'File uploaded successfully', p);
  } catch (error) {
   logger.error(error);
   throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, 'Error while uploading file', );
  }
 }
}

module.exports = PlatformService;