"use strict"
const s3Upload = require('../../utils/file_upload/s3UploadAdaptor'),
path = require('path'),
 s3FileUpload = require('../../utils/file_upload/s3UploadAdapt'),
  {
    logger
  } = global,
  {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_BAD_REQUEST,
    HTTP_NOT_FOUND,
    HTTP_FORBIDDEN
  } = require('../../utils/http.response.code'),
  {
    PROJECT_CREATED,
    PROJECT_UPDATED,
    PROJECT_DELETED,
    PROJECT_RETRIEVED,
    PROJECT_NOT_FOUND,
    INTERNAL_SERVER_ERROR,
    PROJECT_CREATED_FAILED,
    ONLY_OWNER_CAN_DELETE_PROJECT,
    CANT_CREATE_CAPSTONE,
    LIKED,
    UNLIKED,
    DRAFT_UPDATED,
    DRAFT_UPDATED_FAILED,
    DRAFT_SAVED,
    DRAFT_SAVED_FAILED,
    RATED,


  } = require('../../utils/http.response.message'),
  {
    FELLOW,
    SUPERADMIN,
    ADMIN
  } = require("../../utils/role"),
  {
    projectDeletionSchema
  } = require("../../utils/request.schema"),
  validator = require("../../utils/validator"),
  ApiResponse = require("../../utils/http.response"),
  MailNotificationService = require("../../services/mail.notification.service"),
  AccountService = require("../../services/account.service"),
  CommentService = require("../../services/comment.service"),
  PortfolioService = require('../../services/portfolio.service'),
  ProjectService = require('../../services/project.service'),
  ProfileService = require('../../services/profile.service'),
  RatingService = require('../../services/rating.service'),
  OAuthService = require('../../services/oauth.service'),
  {
    W
  } = require('../../services/wikiAndVideo.service');
const fs = require('fs');
/**
 * @param {String} pid - project id of the user
 * @param {Object} body - project object to be created
 * @returns 
 */
exports.createProject = async ({
  pid,
  role,
  params,
  files
}, body) => {
  try {
    if(files == (undefined || null)){
      throw ApiResponse.gen(HTTP_BAD_REQUEST, 'Project thumbnail must be provided');
    }
    if (files && files.file) {
      const img = await s3FileUpload(files.file, 'project');
      body.image = img;
    }
    let attachments = [];
    if (files && files.attachments && files.attachments instanceof Array) {
      for (let originalFile of files.attachments) {
        // upload the file to s3
        const file = await s3FileUpload(originalFile,'project');
        
        const name = path.basename(originalFile.name, path.extname(originalFile.name));
        attachments.push({file, name: name.replace(/[^a-zA-Z]/g, ' ').trim() || 'Untitled', ext: path.extname(originalFile.name).replace('.', '')});
      }
    } else if(files && files.attachments){
      let originalFile = files.attachments;
      const file = await s3FileUpload(originalFile,'project');
        const name = path.basename(originalFile.name, path.extname(originalFile.name));
      
        attachments.push({file, name: name.replace(/[^a-zA-Z]/g, ' ').trim() || 'Untitled', ext: path.extname(originalFile.name).replace('.', '')});
    }
    body.attachments = attachments;
    body.createdBy = pid;
    params.isDraft = params.isDraft == 'true' ? true : false;
    params.postId = params.postId ? params.postId : false;

    if (role === FELLOW && body.type.toLowerCase() == 'capstone') {
      throw ApiResponse.gen(HTTP_FORBIDDEN, CANT_CREATE_CAPSTONE);
    } else if ([ADMIN, SUPERADMIN].includes(role) && body.type.toLowerCase() == 'capstone') body.isVisible = false;

    if (params.isDraft == true && params.postId == false) {
      /* client wants to save to draft - first action */
      body.isDraft = true;
      const createdProject = await ProjectService.createProject(body);
      if (createdProject) {
        return ApiResponse.gen(HTTP_CREATED, DRAFT_SAVED, createdProject)
      } else {
        throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, DRAFT_SAVED_FAILED);
      }
    } else if (params.isDraft == true && params.postId) {
      /* Client wants to update the draft */
      await ProjectService.getProjectById(params.postId);
      let updatedProject = await ProjectService.updateProject(params.postId, body);
      if (updatedProject) {
        return ApiResponse.gen(HTTP_OK, DRAFT_UPDATED, updatedProject)
      } else {
        throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, DRAFT_UPDATED_FAILED);
      }
    } else if (params.isDraft == false && params.postId) {
      /* client wants to publish from draft */
      let project = await ProjectService.getProjectById(params.postId);
      body.isDraft = false;
      // create rating
      let rating = await RatingService.createRating(params.postId, 'project');
      // increase the project count
      await PortfolioService.updateTotalCreatedProjects(pid, 'UP');
      body.ratings = [rating._id];
      let updatedProject = await ProjectService.updateProject(params.postId, body);
      if (updatedProject) {

        return ApiResponse.gen(HTTP_CREATED, PROJECT_CREATED, updatedProject)
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, PROJECT_CREATED_FAILED);
      }
    } else {
      /* Client wants to publish immediately */
      await PortfolioService.updateTotalCreatedProjects(pid, 'UP');

      const createdProject = await ProjectService.createProject(body);

      // create rating
      let rating = await RatingService.createRating(createdProject._id, 'project');

      let updatedProject = await ProjectService.findByIdAndUpdate(createdProject._id, {
        $push: {
          ratings: rating._id
        }
      });

      if (createdProject) {
        return ApiResponse.gen(HTTP_CREATED, PROJECT_CREATED, updatedProject)
      } else {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, PROJECT_CREATED_FAILED, createdProject);
      }
    }

  } catch (err) {
    logger.error(err);
    if (err._message === 'Validation failed') throw ApiResponse.gen(HTTP_BAD_REQUEST, err.message)
    if (err.code) throw err
    else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, err.message)
  }
};


exports.cs = async (body, params, user) => {
  try {
    params.isDraft = params.isDraft == 'true' ? true : false;
    params.postId = params.postId ? params.postId : false;
    // validates the projects availability
    const project = await ProjectService.getProjectById(body.projectId);
    if (!project) {
      throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND, project);
    }
    if (project.type.toLowerCase() == 'capstone') {
      body.isApproved = false;
    }
    body.title = body.title == project.title ? body.title : project.title;

    body.project = project._id
    delete body.projectId;


    if (params.isDraft == true && params.postId == false) {
      /* client wants to save to draft - first action */
      body.isDraft = true;
      // creates the solution
      const solution = await W.cs(body, user);
      // link the solution to the project
      await ProjectService.linkSolution(solution._id, project);
      project.solution = solution;

      if (project.solution) {
        project.report = 'save_draft';
        return project;
      } else {
        throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, DRAFT_SAVED_FAILED);
      }
    } else if (params.isDraft == true && params.postId) {
      // console.log('solution ready to be updated');
      await W.g(params.postId);
      /* Client wants to update the draft */
      let updatedSolution = await W.v(params.postId, body, params.postId);
      if (updatedSolution) {
        project.report = 'update_draft';
        project.solution = updatedSolution.data;
        return project;
      } else {
        throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, DRAFT_UPDATED_FAILED);
      }
    } else if (params.isDraft == false && params.postId) {
      await W.g(params.postId);
      /* client wants to publish from draft */
      body.isDraft = false;
      let updatedSolution = await W.v(params.postId, body, params.postId);
      if (updatedSolution) {
        project.report = 'publish_draft';
        project.solution = updatedSolution.data;
        return project;
      } else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, 'Solution not created, please try again.');
    } else {
      /* Client wants to publish immediately */

      // console.log('solution will create by default')
      // creates the solution
      const solution = await W.cs(body, user);
      // link the solution to the project
      await ProjectService.linkSolution(solution._id, project);
      project.solution = solution;
      project.report = 'publish_now'
      return project
    }

  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }

}

exports.getProject = async (id, obj) => {
  try {
    const project = await ProjectService.getProjectById(id, obj);
    if (project) {
      return ApiResponse.gen(HTTP_OK, PROJECT_RETRIEVED, project)
    } else {
      throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND, project);
    }
  } catch (err) {
    logger.error(err)
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}

exports.updateProject = async (id, body, files) => {
  
  try {
    
    if (files.file) {
      const img = await s3FileUpload(files.file, 'project');
      body.image = img;
    }
    let attachments = [];
    
    if (files.attachments && files.attachments instanceof Array) {
      for (let originalFile of files.attachments) {
        const file = await s3FileUpload(originalFile,'project');
        const name = path.basename(originalFile.name, path.extname(originalFile.name));
        attachments.push({file, name: name.replace(/[^a-zA-Z]/g, ' ').trim() || 'Untitled', ext: path.extname(originalFile.name).replace('.', '')});
      }
    } else {
      let originalFile = files.attachments;
      const file = await s3FileUpload(originalFile,'project');
        const name = path.basename(originalFile.name, path.extname(originalFile.name));
      
        attachments.push({file, name: name.replace(/[^a-zA-Z]/g, ' ').trim() || 'Untitled', ext: path.extname(originalFile.name).replace('.', '')});
      
    }
    body.attachments = attachments;

    let updatedProject = await ProjectService.updateProject(id, body);
    if (updatedProject) {

      return ApiResponse.gen(HTTP_OK, PROJECT_UPDATED, updatedProject)
    } else {
      throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND, updatedProject);
    }
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}

exports.deleteProject = async (id, user) => {
  try {

    const project = await ProjectService.getProjectById(id);

    if (project) {
      const projectOwnerId = project.createdBy.user._id.toString();

      await RatingService.deleteRating(project._id, 'project');

      if (user.role == FELLOW) {
        if (projectOwnerId !== user.id) {
          throw ApiResponse.gen(HTTP_FORBIDDEN, ONLY_OWNER_CAN_DELETE_PROJECT)
        } else {
          const deletedProject = await ProjectService.deleteProject(id);

          // decrease the project count
          await PortfolioService.updateTotalCreatedProjects(user.pid, 'DOWN');

          const deletedComment = await CommentService.deleteMany({
            type: "project",
            project: id
          });

          const removedProject = await PortfolioService.removeDeletedProject(project._id, project.type);

          logger.info("removed project", removedProject);
          logger.info("deletedProject", deletedProject._id);
          logger.info("deletedComments", deletedComment);

          logger.info(deletedProject.solutions);
          if (deletedProject.solutions.length > 0) {
            const deletedSolution = await W.f(deletedProject._id)

            logger.info("deletedSolution", deletedSolution);
          }
          return ApiResponse.gen(HTTP_OK, PROJECT_DELETED)
        }
      } else if (user.role == SUPERADMIN) {
        if (projectOwnerId !== user.id) {
          const valid = await validator(projectDeletionSchema, user.body);
          if (valid.ok) {
            const {
              reason
            } = valid.data;
            // delete project
            const deletedProject = await ProjectService.deleteProject(id);
            // decrease the project count
            await PortfolioService.updateTotalCreatedProjects(user.pid, 'DOWN');

            await CommentService.deleteMany({
              type: "project",
              project: id
            });

            const removedProject = await PortfolioService.removeDeletedProject(project._id, project.type);

            // console.log("removed project", removedProject);
            logger.info("deletedProject", deletedProject._id);
            // logger.info("deletedComments", commentIds);

            if (deletedProject.solutions.length > 0) {
              const deletedSolution = await W.f(deletedProject._id)

              logger.info("deletedSolution", deletedSolution);
            }
            // get user email 
            const {
              data
            } = await AccountService.getAccountById(projectOwnerId);
            const {
              email
            } = data;
            // send deletion notification to project owner explaining why project was deleted
            const mailOption = {
              to: email,
              reason,
              type: "Project"
            }
            MailNotificationService.sendDataDeletionNotification(mailOption);
            return ApiResponse.gen(HTTP_OK, PROJECT_DELETED)
          }
          throw valid
        } else if (projectOwnerId === user.id) {
          // delete the admins project
          const deletedProject = await ProjectService.deleteProject(id);

          // decrease the project count
          await PortfolioService.updateTotalCreatedProjects(user.pid, 'DOWN');

          const deletedComment = await CommentService.deleteMany({
            type: "project",
            project: id
          });
          // let commentIds = deletedComment.map(comment => comment._id);

          logger.info("deletedProject", deletedProject._id);
          logger.info("deletedComments", deletedComment);

          if (deletedProject.solutions.length > 0) {
            const deletedSolution = await W.f(deletedProject._id)

            logger.info("deletedSolution", deletedSolution);
          }
          return ApiResponse.gen(HTTP_OK, PROJECT_DELETED)
        }

      }


    } else {
      throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND);
    }
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}

exports.getFilteredProjects = async (filter, {
  pid,
  role
}) => {
  try {
    if (role == FELLOW) filter.isVisible = true;
    const user = await ProfileService.findById(pid);

    user.role = role;
    // console.log(user);
    const projects = await ProjectService.getAllProjects(filter, user);
    // fs.writeFileSync('project.json', JSON.stringify(projects.data), {
    //   encoding: "utf8",
    //   mode: 0o666
    // })
    // if (projects) {
    return ApiResponse.gen(HTTP_OK, PROJECT_RETRIEVED, projects)
    // } else {
    //   throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND, projects);
    // }
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }

}

exports.likeProject = async (projectId, pid) => {
  try {
    const project = await ProjectService.findById(projectId);
    if (!project) {
      throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND);
    } else {
      const liked = await ProjectService.likeProject(project, pid);
      if (liked == 'liked') {
        return ApiResponse.gen(HTTP_CREATED, LIKED);
      } else return ApiResponse.gen(HTTP_OK, UNLIKED);
    }
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}

exports.rateProject = async (projectId, body) => {
  try {
    const project = await ProjectService.getProjectById(projectId);

    body.type = 'project';
    body.weight = body.rating;
    delete body.rating;
    const rated = await RatingService.rate(project._id, body);

    return ApiResponse.gen(HTTP_CREATED, "Project " + RATED, rated);

  } catch (err) {
    logger.error(err);
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, err)
  }
}

exports.authorizeLinkedinUser = async (project) => {
  try {
    return await OAuthService.authorizeLinkedinUser();
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}

exports.getUserAccessToken = async (code) => {
  try {
    return await OAuthService.getUserAccessToken(code);
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}

exports.getLinkedinUser = async (accessToken) => {
  try {
    return await OAuthService.getLinkedinUser(accessToken);
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}

exports.sharePostToLinkedin = async (accessToken, urn, projectId) => {
  try {

    let res = await OAuthService.sharePostToLinkedin(accessToken, urn, projectId);
    return ApiResponse.gen(HTTP_OK, "Post shared to Linkedin", res);
  } catch (err) {
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR)
  }
}