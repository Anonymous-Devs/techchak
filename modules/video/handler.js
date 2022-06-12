const s3 = require('../../utils/file_upload/s3UploadAdapt');
const ApiResponse = require('../../utils/http.response');
const {
 VideoService
} = require('../../services/wikiAndVideo.service'),
CommentService = require('../../services/comment.service'),
 ProjectService = require('../../services/project.service'),
 ProfileService = require('../../services/profile.service');


const {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
  HTTP_CREATED,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST
} = require('../../utils/http.response.code');

const {
    VIDEO_NOT_FOUND,
  } = require('../../utils/http.response.message');


 exports.createVideo = async (body, req) => {
  if(body.type.toLowerCase() == 'solution'){
    if(!req.query.projectId) {
      throw ApiResponse.gen(HTTP_BAD_REQUEST, 'Project ID is required to create this solution.')
    }
    await ProjectService.getProjectById(req.params.projectId)
    body.project = req.params.projectId;
  }

  if(body.videoType.toLowerCase() == "raw"){
    const vid = await s3(req.files.file, 'video')
    body.file = vid
  }

 const createdVideo = await VideoService.createVideo(body);

 return  createdVideo;
}

exports.getVideoById = async (id) => {
  const vid = await VideoService.getVideoById(id);
  return vid;
}

exports.updateVideo = async(id, body) => {
  const updatedVideo = await VideoService.update(id, body);
  // console.log(updatedVideo)
  return updatedVideo
}

exports.getVideoByPagination = async function (query, decoded) {
  const user = await ProfileService.findById(decoded.pid);
  user.role = decoded.role;
  query = query || {};
  query.skip = query.offset;
  delete query.offset;
  const vid = await VideoService.findAllVideos(query, user);

  return vid
}

exports.deleteVideo = async (id, user) => {
  const deletedVideo = await VideoService.delete(id, user);

  if (deletedVideo.code) {
    await CommentService.deleteMany({
      type: "video",
      video: id
    });
  }

   return deletedVideo;
  
}

exports.likeVideo = async (id, pid) => {
  try{
  const video = await VideoService.findById(id);
  if(video) {
    const response = await VideoService.likeVideo(video, pid);
    if(response == 'liked'){
      return ApiResponse.gen(HTTP_CREATED, 'Video liked successfully')
    }else {
      return ApiResponse.gen(HTTP_OK, 'Video unliked successfully')
    }
  } else {
    return ApiResponse.gen(HTTP_NOT_FOUND, VIDEO_NOT_FOUND)
  }
} catch(e) {
  throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, 'Something went wrong, please try again', e)
}
}
