const {
  uploadBase64ImageFile,
  getFileLink
} = require('../s3');
const ApiResponse = require('../http.response');
const {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST,
  HTTP_UNSUPPORTED_MEDIA_TYPE
} = require('../http.response.code');
const {
  FILE_STRING,
  FILE_FORMAT
} = require('../http.response.message');
const path = require('path');

module.exports = async (body) => {
  try {
    let {
      file,
      folder
    } = body;

    folder = folder || "uploads";

    if (!file) {
      throw ApiResponse.gen(HTTP_BAD_REQUEST, 'File must be provided');
    }

    if (typeof (file) !== 'string') {
      throw ApiResponse.gen(HTTP_BAD_REQUEST, FILE_STRING);
    }

    let mimetype = ['video/mp4', 'image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
    let mime = file.split(';base64')[0].split(':')[1];

    if (!mimetype.includes(mime)) {
      throw ApiResponse.gen(HTTP_UNSUPPORTED_MEDIA_TYPE, FILE_FORMAT);
    }

    // Generate new filename
    let newFileName = `backend-uploads/${folder}/${Date.now()}_${folder}.${mime.split('/')[1]}`;

    // upload file
    const fileData = {
      file: file,
      mimeType: mime,
      filename: newFileName
    }

    const s3Data = await uploadBase64ImageFile(fileData);

    const fileLink = await getFileLink(newFileName).then(res => res.split('?')[0]);
    return fileLink;

  } catch (err) {
    logger.error(err)
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, 'File upload failed')
  }

}