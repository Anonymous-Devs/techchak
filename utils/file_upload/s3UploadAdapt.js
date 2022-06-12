const {
  uploadImageFile,
  getFileLink
} = require('../s3');
const ApiResponse = require('../http.response');
const {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST
} = require('../http.response.code');

module.exports = async (file, folder) => {
  try {

    folder = folder || "uploads";
    if (!file) {
      throw ApiResponse.gen(HTTP_BAD_REQUEST, 'File must be provided');
    }


    if (!file.mimetype === 'image/jpeg' || !file.mimetype === 'image/png' || !file.mimetype === 'image/jpg') {
      throw ApiResponse.gen(HTTP_UNSUPPORTED_MEDIA_TYPE, 'file type is not one of the supported type [jpg, png, jpeg]');
    }
    if (!file.mimetype === 'application/pdf') {
      throw ApiResponse.gen(HTTP_UNSUPPORTED_MEDIA_TYPE, 'file is not pdf');
    } else if (!file.mimetype === 'video/mp4') {
      throw ApiResponse.gen(HTTP_UNSUPPORTED_MEDIA_TYPE, 'file is not video');
    } else if (!file.mimetype === 'text/csv') {
      throw ApiResponse.gen(HTTP_UNSUPPORTED_MEDIA_TYPE, 'file is not csv');
    }

    const filePath = file.tempFilePath;

    // generate new filename
    let newFileName = `backend-uploads/${folder}/${Date.now()}_${folder}`;

    // upload file
    const fileData = {
      file: filePath,
      filename: newFileName,
      mimeType: file.mimetype,
    }

    const s3Data = await uploadImageFile(fileData);
    
      const fileLink = getFileLink(newFileName).then(res => res.split('?')[0]);

      if(fileLink) helper.deleteFileFrom(file.tempFilePath)

      return fileLink;
    
  } catch (err) {
    logger.error(err)
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, 'File upload failed')
  }
}