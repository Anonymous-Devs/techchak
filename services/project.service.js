"use strict"
const {
  projectModel
} = require('../modules/projects/model');
const {
  FELLOW,
  BUILDER
} = require("../utils/role");
const dayjs = require('dayjs');

class Project extends projectModel {

  static async getProjectById(id) {
    let project = await this.findById(id)
      .populate([{
          path: 'comments',
          populate: {
            path: 'createdBy',
            populate: {
              path: 'user',
              select: "-password -passwordArchived -defaultPassword"
            }
          }
        },
        'ratings',
        'likes', {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }
      ])
      .exec();

    if (project) {
      return project;
    } else throw {
      code: 404,
      message: "Project not found"
    }
  }

  static async createProject(project, ratingId) {
    try {
      project.ratings = ratingId;
      const newProject = await this.create(project);
      return newProject.populate('createdBy');
    } catch (err) {
      throw err;
    }
  }

  static async updateProject(id, project) {
    const updatedProject = await this.findByIdAndUpdate(id, {
      $set: project
    });
    return updatedProject.populate([{
        path: 'comments',
        populate: {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }
      },
      'ratings',
      'likes', {
        path: 'createdBy',
        populate: {
          path: 'user',
          select: "-password -passwordArchived -defaultPassword"
        }
      }
    ])
  }

  static async deleteProject(id) {
    const deletedProject = await this.findByIdAndDelete(id);
    return deletedProject;
  }

  static async deleteByOwner(pid) {
    const deletedProject = await this.deleteMany({
      createdBy: pid
    });
    if (deletedProject) {
      return {
        name: "Project",
        ...deletedProject
      };
    } else {
      return {
        name: "Project",
        acknowledged: false,
        deletedCount: 0
      };
    }
  }

  static async getAllProjects(data, user) {
    let pid = user._id
    let {
      type,
      department,
      area,
      level,
      eta,
      search,
      createdBy,
      isVisible,
      isDraft,
      createdAt
    } = data;
    data.limit = data.limit || Infinity;
    data.skip = data.offset > 0 ? data.offset - 1 : 0;

    let filter = {
      type: helper.regex(type),
      department: helper.regex(department),
      area: helper.regex(area),
      level: helper.regex(level),
      eta: eta ? eta.replace(/-/g, '/') : undefined,
      title: helper.regex(search),
      createdBy,
      isVisible,
      isDraft,
      createdAt
    };


    if (!type) delete filter.type;
    if (!department) delete filter.department;
    if (!area) delete filter.area;
    if (!level) delete filter.level;
    if (!eta) delete filter.eta;
    if (!search) delete filter.title;
    if (!createdBy) delete filter.createdBy;
    if (isDraft == undefined || isDraft == null) delete filter.isDraft
    if(isVisible == undefined || isVisible == null) delete filter.isVisible
    if(!createdAt) delete filter.createdAt 
    
    if (createdAt) {
      // filter.role = type || FELLOW;
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      filter.createdAt = {
        $gte: dayjs(date)
          .subtract(createdAt || 7, "day")
          .toISOString()
      }
    }

    let projects = await this.find(filter).skip(data.skip * data.limit).limit(data.limit).sort({
      createdAt: -1
    }).populate([{
        path: 'comments',
        populate: {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }
      },
      'ratings',
      'likes', {
        path: 'createdBy',
        populate: {
          path: 'user',
          select: "-password -passwordArchived -defaultPassword"
        }
      }
    ]);

    let tags = [],
      filteredProjects = [],
      dep = [],
      all = [],
      xplevel = []
    if ([BUILDER, FELLOW].includes(user.role)) {
      projects.filter((project, i) => {
        if (project.department == user.department && project.area == user.area && project.level == user.experienceLevel && user.skillset.includes(project.tags[i])) {
          tags.push(project);
        } else if (project.department == user.department && project.area == user.area && project.level == user.experienceLevel) {
          filteredProjects.push(project);
        } else if (project.department == user.department && project.area == user.area) {
          dep.push(project);
        } else if (project.level == user.experienceLevel) {
          xplevel.push(project);
        } else all.push(project);
      });

      filteredProjects = [...tags, ...filteredProjects, ...dep, ...xplevel, ...all];
    } else {
      filteredProjects = projects;
    }

    filteredProjects = filteredProjects.filter(filteredProject => {
      if (filteredProject.createdBy._id.toString() != pid) {
        if (filteredProject.isDraft !== true) return filteredProject
      } else return filteredProject
    });


    let pageCount
    if ([BUILDER, FELLOW].includes(user.role)) {
      pageCount = await this.countDocuments(filter).where('isDraft').equals(false).and([{
        isVisible: {
          $eq: true
        }
      }]);
    } else {
      pageCount = await this.countDocuments(filter).where('isDraft').equals(false);
    }


    projects = {
      data: filteredProjects,
      totalPages: Math.ceil(pageCount / data.limit) || 1,
      page: parseInt(data.skip) + 1,
      perPage: parseInt(data.limit) || pageCount,
      pageCount: projects.length
    };
    
    return projects;
  }

  static async getRoadMapProjects(data, user) {
    const projects = await this.getAllProjects(data, user);
    return projects;
  }

  static async cc(id, commentId) {
    try {
      const project = await this.getProjectById(id);
      if (project) {
        project.comments.push(commentId);
        return await project.save();
      } else throw {
        code: 404,
        message: "Project not found"
      }
    } catch (err) {
      if (!err.code) throw err;
      else {
        logger.error(err);
        throw {
          code: 500,
          message: "Failed to create comment"
        };
      }
    }
  }

  static async linkSolution(solutionId, project) {
    try {
      const updatedProject = await this.findByIdAndUpdate(project._id, {
        $push: {
          solutions: solutionId
        }
      })

      if (updatedProject.solutions.indexOf(solutionId) == 0) {
        logger.info(`Solution ${solutionId} linked to project ${updatedProject._id}`);
      } else {
        logger.error(`Failed to link solution ${solutionId} to project ${project._id}`);
      }

    } catch (err) {
      logger.error(err);
      throw {
        code: 500,
        message: "Failed to link solution"
      };
    }
  }

  static async detachSolution(solutionId, projectId) {
    try {

      const updatedProject = await this.findByIdAndUpdate(projectId, {
        $pull: {
          solutions: solutionId
        }
      });

      if (updatedProject.solutions.indexOf(solutionId) == -1) {
        logger.info(`Solution ${solutionId} detached from project`, updatedProject._id);
      } else {
        logger.error(`Failed to detach solution ${solutionId} from project ${projectId}`);
      }

      return updatedProject
    } catch (err) {
      logger.error(err);
      throw {
        code: 500,
        message: "Failed to detach solution"
      };
    }
  }

  static async likeProject(project, pid) {

    const {
      likes
    } = project;

    if (likes.includes(pid)) {
      project.likes = likes.filter(id => id.toString() !== pid.toString());
      await project.save();
      return 'unliked';
    } else {
      project.likes.push(pid);
      await project.save();
      return 'liked';
    }
  }
}
module.exports = Project;