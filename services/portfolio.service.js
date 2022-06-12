// /* eslint-disable no-useless-catch */
const PortfolioModel = require('../modules/portfolio/model');
const ApiResponse = require('../utils/http.response');

const {
  HTTP_NOT_FOUND,
  HTTP_OK,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_FORBIDDEN
} = require('../utils/http.response.code'),

  {
    PORTFOLIO_NOT_FOUND,
    SOMETHING_WENT_WRONG,
    PORTFOLIO_RETRIEVED,
    PROJECT_NOT_FOUND,
    PROJECT_RETRIEVED,
    PROJECT_STATUS_UPDATED_FAILED,
    PROJECT_STATUS_UPDATED,
    TO_DO_PROJECT_CREATED,
    TO_DO_PROJECT_CREATED_FAILED,
    DUPLICATE_PROJECT_ADDED,
    PROJECT_SOLUTION_CREATED,
    PROJECT_SOLUTION_CREATED_FAILED,
    TO_DO_PROJECT_REMOVED,
    TO_DO_PROJECT_REMOVED_FAILED,
    CANT_REMOVE_ROADMAP_PROJECT_FROM_TODO,
    DRAFT_SAVED,
    DRAFT_UPDATED,
  } = require('../utils/http.response.message'), {
    W
  } = require("./wikiAndVideo.service")


class Portfolio extends PortfolioModel {
  /**
   * @description - Deletes a user by their ID
   * @param {String} ProfileId - User profile ID 
   * @returns 
   */
  static async deleteByOwner(ProfileId) {

    const deleted = await this.deleteMany({
      user: ProfileId
    })
    if (!deleted) {
      return {
        name: "Portfolio",
        acknowledged: false,
        deletedCount: 0
      };
    } else {
      return {
        name: "Portfolio",
        ...deleted
      };
    }
  }

  /**
   * @description - Gets a users portfolio by their Profile ID
   * @param {String} ProfileId - User profile ID 
   * @returns user portfolio
   */
  static async getPortfolioByUserId(ProfileId) {
    try {
      const portfolio = await this.findOne({
          user: ProfileId
        })
        .populate([{
            path: "personal",
            populate: {
              path: 'project',
              populate: {
                path: 'createdBy',
                populate: {
                  path: 'user',
                  select: "-password -passwordArchived -defaultPassword"
                },
              },
            }
          },
          {

            path: "personal",
            populate: {
              path: 'project',
              populate: {
                path: 'comments',
                populate: {
                  path: 'createdBy',
                  populate: {
                    path: 'user',
                    select: "-password -passwordArchived -defaultPassword"
                  }
                },

              }
            },
          },
          {
            path: "capstone",
            populate: {
              path: 'project',
              populate: {
                path: 'createdBy',
                populate: {
                  path: 'user',
                  select: "-password -passwordArchived -defaultPassword"
                },
              },
            }
          },
          {
            path: "capstone",
            populate: {
              path: 'project',
              populate: {
                path: 'comments',
                populate: {
                  path: 'createdBy',
                  populate: {
                    path: 'user',
                    select: "-password -passwordArchived -defaultPassword"
                  }
                },
              }
            },
          },
          {
            path: "team",
            populate: {
              path: 'project',
              populate: {
                path: 'createdBy',
                populate: {
                  path: 'user',
                  select: "-password -passwordArchived -defaultPassword"
                },
              },
            }
          },
          {

            path: "team",
            populate: {
              path: 'project',
              populate: {
                path: 'comments',
                populate: {
                  path: 'createdBy',
                  populate: {
                    path: 'user',
                    select: "-password -passwordArchived -defaultPassword"
                  }
                },

              }
            },
          }
        ]);

      if (!portfolio) {
        throw ApiResponse.gen(HTTP_NOT_FOUND, PORTFOLIO_NOT_FOUND);
      }
      return ApiResponse.gen(HTTP_OK, PORTFOLIO_RETRIEVED, portfolio);
    } catch (err) {

      if (err.code) throw err
      else{
        logger.error(err);
         throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
      }
    }
  }

  /**
   * 
   * @param {String} ProfileId - User profile ID
   * @param {String} projects - Projects to be added to the portfolio
   * @returns 
   */
  static async setUpPortfolio(ProfileId, projects) {
    const body = {};
    body.user = ProfileId;

    if (projects) {
      // set up users roadmap
      body.roadmap = projects.map(p => {
        return {
          name: p.title,
          status: "incomplete",
          eta: p.eta,
          project: p._id
        }
      });
      // set up users To-Do projects
      body.personal = projects.map(p => {
        const data = {
          status: 'To Do',
          project: p._id
        }
        return data;
      })
    }
    const port = await this.create(body)
    return port;
  }

  static async getPortfolioByUserIdAndProjectId(ProfileId, projectId, type) {
    try {
      type = type.toLowerCase();
      // console.log(type);
      const portfolio = await this.findOne({
          user: ProfileId,
        })
        .populate([{
            path: type,
            populate: {
              path: 'project',
              populate: {
                path: 'createdBy',
                populate: {
                  path: 'user',
                  select: "-password -passwordArchived -defaultPassword"
                },
              },

            }
          },
          {

            path: type,
            populate: {
              path: 'project',
              populate: {
                path: 'comments',
                populate: {
                  path: 'createdBy',
                  populate: {
                    path: 'user',
                    select: "-password -passwordArchived -defaultPassword"
                  }
                },

              }
            },
          }
        ])

      // logger.info(portfolio)

      const actualProject = portfolio[type].find(p => {

        return p.project._id.toString() === projectId
        // else return null
      })

      // logger.info(actualProject)
      if (!actualProject) {
        throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND);
      }
      return ApiResponse.gen(HTTP_OK, PROJECT_RETRIEVED, actualProject);
    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }
  }

  static async updatePortfolioProjectStatus(pid, {
    status,
    projectId,
    type
  } = {}) {
    try {

      const portfolio = await this.findOne({
        user: pid
      });

      if (!portfolio) {

        throw ApiResponse.gen(HTTP_NOT_FOUND, PORTFOLIO_NOT_FOUND);
      }

      type = type.toLowerCase();

      let notFound = true;
      const portfolioProjects = portfolio[type].filter(p => {
        if (p.project._id.toString() === projectId) {

          p.status = status;
          notFound = false;
        }
        return p;
      });

      if (notFound) {
        throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND);
      }
      portfolio[type] = portfolioProjects;
      let updated = await portfolio.save();

      if (updated) {
        return ApiResponse.gen(HTTP_OK, PROJECT_STATUS_UPDATED, updated);
      } 

    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG,err);
    }
  }

  static async addToDoProject(pid, {
    projectId,
    type
  } = {}) {
    try {
      type = type.toLowerCase();
      await this.preventAdditionOfDuplicateProjects(pid, {
        projectId,
        type
      });

      const portfolio = await this.findOne({
        user: pid
      });
      if (!portfolio) {
        throw ApiResponse.gen(HTTP_NOT_FOUND, PORTFOLIO_NOT_FOUND);
      }

      const newProject = {
        status: 'To Do',
        project: projectId
      }

      portfolio[type].push(newProject);

      const createdProject = await portfolio.save();
      if (!createdProject) {
        throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, TO_DO_PROJECT_CREATED_FAILED);
      } else return ApiResponse.gen(HTTP_CREATED, TO_DO_PROJECT_CREATED, createdProject);
    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }


  }

  static async removeFromToDoProject(pid, project) {
    try {
      const portfolio = await this.findOne({
        user: pid
      });

      const type = project.type.toLowerCase();
      if (!portfolio) {
        throw ApiResponse.gen(HTTP_NOT_FOUND, PORTFOLIO_NOT_FOUND);
      }

      let notFound = true;
      const portfolioProjects = portfolio[type].filter(data => {
        if (data.project.toString() === project._id.toString()) {

          // Flag the project completed on the road
          portfolio.roadmap.find(data => {
            if (data.project.toString() === project._id.toString()) {
              throw ApiResponse.gen(HTTP_FORBIDDEN, CANT_REMOVE_ROADMAP_PROJECT_FROM_TODO);
            }
          })


          notFound = false
        }

        if (data.project.toString() !== project._id.toString()) {
          return data
        }
      });

      if (notFound) {
        throw ApiResponse.gen(HTTP_NOT_FOUND, PROJECT_NOT_FOUND);
      }

      portfolio[type] = portfolioProjects;
      const updated = await portfolio.save();
      if (!updated) {
        throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, TO_DO_PROJECT_REMOVED_FAILED);
      }
      return ApiResponse.gen(HTTP_OK, TO_DO_PROJECT_REMOVED, updated);

    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }
  }

  static async preventAdditionOfDuplicateProjects(pid, {
    projectId,
    type
  } = {}) {
    try {
      type = type.toLowerCase();
      const portfolio = await this.findOne({
        user: pid
      }).populate([{
        path: type,
        populate: {
          path: 'project'
        }
      }]);

      // if (!portfolio) {
      //  return false;
      // }
      
      const project = portfolio[type].find(p => p.project._id.toString() === projectId)
      if (project) {
        throw ApiResponse.gen(HTTP_BAD_REQUEST, DUPLICATE_PROJECT_ADDED);
      }
    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }
  }

  static async submitProjectSolution(pid, project) {
    try {
      const portfolio = await this.findOne({
        user: pid
      });

      /* confirms that the solution was submitted */
      if (project.solution._id) {
        const type = project.type.toLowerCase();

        const portfolioProjects = portfolio[type].filter(data => {
          /* Checks  if project is in the portfolio */
          if (data.project.toString() === project._id.toString()) {

            /* Updates the project status to completed on the road */
            portfolio.roadmap = portfolio.roadmap.filter(data => {
              /* Checks if the project is in the roadmap before updating it */
              if (data.project.toString() === project._id.toString()) {
                data.status = 'Completed';
                portfolio.progress += 10;

              }
              return data
            })
            /* updates the number of completed projects if its not capstone project */
            if(type != 'capstone') portfolio.totalProjectCompleted += 1;
            
          }
          /* Removes the completed project from the uncompleted ones */
          if (data.project.toString() !== project._id.toString()) {
            return data
          }
        });


        if (project.report == 'save_draft') {
          return ApiResponse.gen(HTTP_CREATED, DRAFT_SAVED);
        } else if (project.report == 'update_draft') {
          return ApiResponse.gen(HTTP_CREATED, DRAFT_UPDATED);
        } else if (project.report == 'publish_draft' || project.report == 'publish_now') {
          // saves the and updates the portfolio
          portfolio[type] = portfolioProjects;
          let updated = await portfolio.save();
          updated = await this.findOneAndUpdate({
            user: pid
          }, {
            $set: {
              roadmap: portfolio.roadmap,

            }
          })

          if (updated) {
            return ApiResponse.gen(HTTP_CREATED, PROJECT_SOLUTION_CREATED, updated);
          } else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, PROJECT_SOLUTION_CREATED_FAILED);
        } else {
          throw ApiResponse.gen(HTTP_BAD_REQUEST, 'Invalid report type');
        }
      } else throw ApiResponse.gen(HTTP_BAD_REQUEST, PROJECT_SOLUTION_CREATED_FAILED);
    } catch (err) {
      logger.info(err)
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }
  }

  static async removeDeletedProject(projectId, type) {
    try {


      const portfolios = await this.find({
        $or: [{
          'personal.project': projectId
        }, {
          'capstone.project': projectId
        }, {
          'team.project': projectId
        }]
      });

      type = type.toLowerCase();
      let updated;
      if (portfolios.length) {
        for (let portfolio of portfolios) {


          const portfolioProjects = portfolio[type].filter(data => {

            if (data.project.toString() !== projectId.toString()) {

              return data
            }
          });

          portfolio.roadmap = portfolio.roadmap.filter(data => {
            if (data.project.toString() !== projectId.toString()) {
              return data
            }
          })

          if (portfolioProjects instanceof Array) {
            portfolio[type] = portfolioProjects;

            updated = await portfolio.save();
          }
        }

        if (updated) {
          return updated;
        } else logger.error("failed to remove project from portfolio")
      }
    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }
  }

  static async updateTotalCreatedProjects(pid, type) {
    try {

      const val = type.toLowerCase() == 'up' ? 1 : type.toLowerCase() == 'down' ? -1 : 1;

      const updated = await this.findOneAndUpdate({
        user: pid
      }, {
        $inc: {
          totalProjectCreated: val
        }
      });


      if (updated) {
        return true
      } else return false

    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }
  }


  static async decreaseTotalCompletedProject(pid, projectId) {
    try {


      const updated = await this.findOneAndUpdate({
        user: pid
      }, {
        $inc: {
          totalProjectCompleted: -1
        }
      });

      if (updated) {
        updated.roadmap.find((road, i) => {
          if (road.project.toString() === projectId.toString()) {
            updated.roadmap[i].status = 'Incomplete';
            updated.progress -= 10;
          }
        })
        await updated.save();
        return true
      } else return false

    } catch (err) {
      if (err.code) throw err
      else throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG);
    }
  }
}


module.exports = Portfolio;