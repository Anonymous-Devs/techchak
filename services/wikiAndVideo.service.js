"use strict";

const path = require('path'),
  {
    HTTP_OK,
    HTTP_BAD_REQUEST,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_NOT_FOUND,
    HTTP_CONFLICT,
    HTTP_CREATED,
    HTTP_FORBIDDEN
  } = require(path.resolve('utils', 'http.response.code')),
  {
    FELLOW,
    SUPERADMIN,
    BUILDER
  } = require("../utils/role"),

  {
    INTERNAL_SERVER_ERROR,
    WIKI_CREATED,
    WIKI_CREATED_FAILED,
    WIKI_UPDATED,
    WIKI_UPDATED_FAILED,
    WIKI_DELETED,
    WIKI_RETRIEVED,
    WIKIS_RETRIEVED,
    WIKI_NOT_FOUND,
    PROJECT_SOLUTION_CREATED_FAILED,
    SOLUTION_ALREADY_EXIST,

    VIDEO_CREATED,
    VIDEO_CREATED_FAILED,
    VIDEO_UPDATED,
    VIDEO_UPDATED_FAILED,
    VIDEO_DELETED,
    VIDEO_RETRIEVED,
    VIDEO_NOT_FOUND
  } = require('../utils/http.response.message'),

  wikiModel = require('../modules/wiki/model'),
  videoModel = require('../modules/video/model'),

  A = require(path.resolve(path.resolve('utils', 'http.response'))),
  M = require('./mail.notification.service'),
  H=helper;
const dayjs = require('dayjs');

class W extends wikiModel {
  static o = H.superFun()

  static _h(v) {
    return H.ninja4(this,v);
  }
  static async c(data, k = {}) {
    let _=this, p= _._h(4), d= _._h(6),idr,pi, u =_._h(2);
    
    try {
      idr = k[d] == 'true' ? true : false;
      pi = k[p] ? k[p] : false;

      if (idr == true && pi == false) {
        u = _._h(10);
        /* client wants to save to draft - first action */
        data[d] = idr;
        const newWiki = await _[u](data);

        if (newWiki) {
          return A.gen(HTTP_CREATED, "Post saved to draft successfully", newWiki);
        } else throw A.gen(HTTP_INTERNAL_SERVER_ERROR, "Failed to save to draft", newWiki);
      } else if (idr == true && pi) {
        /* Client wants to update the draft */
        await _.g(pi);
        let resp = await _[u](pi, data)
        if (resp) {
          return A.gen(HTTP_OK, "Post updated successfully", resp);
        } else {
          throw A.gen(HTTP_INTERNAL_SERVER_ERROR, "Failed to update post");
        }
      } else if (idr == false && pi) {
        /* client wants to publish from draft */
        await _.g(pi);
        data[d] = idr;
        let resp = await _[u](pi, data)

        if (resp) {
          return A.gen(HTTP_CREATED, WIKI_CREATED, resp);
        } else {
          throw A.gen(HTTP_INTERNAL_SERVER_ERROR, WIKI_CREATED_FAILED);
        }

      } else {
        u = _._h(10);
        const newWiki = await _[u](data);

        if (newWiki) {
          return A.gen(HTTP_CREATED, WIKI_CREATED, newWiki);
        } else throw A.gen(HTTP_INTERNAL_SERVER_ERROR, WIKI_CREATED_FAILED, newWiki);
      }

    } catch (err) {
      logger.error(err)
      if (err.code) throw err;
      else {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, WIKI_CREATED_FAILED, msg);
      }
    }
  }

  static async cs(k, v) {
    let _=this, c = _._h(11-1),p= _._h(7-3);
    try {
      k.type = k.type || "solution";

      const s = await this.a({
        type: k.type,
        createdBy: k.createdBy,
        project: k.project,
        department: k.department,
        area: k.area
      }, v)

      let iex = s.data.data[0]

      if (iex) {
        throw A.gen(HTTP_CONFLICT, SOLUTION_ALREADY_EXIST);
      }

      delete k[p];
      const n = await _[c](k);

      if (n) {
        return n;
      } else throw A.gen(HTTP_INTERNAL_SERVER_ERROR, PROJECT_SOLUTION_CREATED_FAILED);

    } catch (err) {
      logger.error(err)
      if (err.code) throw err;
      else {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, WIKI_CREATED_FAILED, msg);
      }
    }
  }

  static async v(k, s, i) {
    try {
      let _=this, c = _._h(2),p= _._h(7-3), d= _._h(6);
      // check if wiki exist
      let m = await _.g(k);

      if (m.data[d] == false && i) {
        throw A.gen(HTTP_CONFLICT, SOLUTION_ALREADY_EXIST);
      }
      let v = await _[c](k, {
        $set: s
      });

      if (!v) throw A.gen(HTTP_INTERNAL_SERVER_ERROR, WIKI_UPDATED_FAILED, v);

      v.populate(['likes', {
        path: 'comments',
        populate: {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }
      }, {
        path: 'createdBy',
        populate: {
          path: 'user',
          select: "-password -passwordArchived -defaultPassword"
        }
      }]);

      return A.gen(HTTP_OK, WIKI_UPDATED, v);

    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, WIKI_UPDATED_FAILED, msg);
      }
      throw err;
    }
  }

  async isOwner(currentLoggedInUser, createdBy) {

    let currentUser = currentLoggedInUser,
      createdUser = createdBy
    if (currentUser.role === SUPERADMIN && [BUILDER, FELLOW].includes(createdUser.role)) {
      return false;
    } else if ([BUILDER, FELLOW].includes(currentUser.role) && [BUILDER, FELLOW].includes(createdUser.role)) {
      if (currentUser.id.toString() === createdUser._id.toString()) {
        return true;
      }
      throw A.gen(HTTP_FORBIDDEN, "You are not allowed to perform this action");
    } else return true

  }

  static async e(id, currentUser, body) {
    try {

      // check if wiki exist
      await this.g(id);

      const w = await this.findById(id)
        .populate({
          path: 'createdBy',
          populate: 'user',
          select: "_id role email"
        });

      const isOwner = await new this().isOwner(currentUser, w.createdBy.user);

      if (isOwner) {
        const deletedWiki = await this.findByIdAndDelete(id);

        return A.gen(HTTP_OK, WIKI_DELETED, deletedWiki);
      } else {
        if (body.reason) {
          const deletedWiki = await this.findByIdAndDelete(id);
          await M.sendDataDeletionNotification({
            to: w.createdBy.user.email,
            name: w.createdBy.firstName,
            type: "Wiki",
            reason: body.reason
          });
          return A.gen(HTTP_OK, WIKI_DELETED, deletedWiki);
        } else throw A.gen(HTTP_BAD_REQUEST, "Please provide a reason for deleting this wiki");
      }
    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, msg);
      }
      throw err;
    }
  }

  static async deleteByOwner(id) {
    try {
      const wikis = await wikiModel.deleteMany({
        createdBy: id
      });

      if (wikis) {
        return {
          name: "Wiki",
          ...wikis
        };
      } else return {
        name: "Wiki",
        acknowledged: false,
        deletedCount: 0
      };

    } catch (err) {
      logger.error(err);

      const msg = err.message;
      throw A.gen(HTTP_INTERNAL_SERVER_ERROR, msg);

    }

  }

  static async g(id) {
    try {
      let _=this, c= _._h(32/2);
      const w = await _[c](id).populate(['likes', {
        path: 'comments',
        populate: {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }
      }, {
        path: 'createdBy',
        populate: {
          path: 'user',
          select: "-password -passwordArchived -defaultPassword"
        }
      }]);
      if (w) return A.gen(HTTP_OK, WIKI_RETRIEVED, w);
      else throw A.gen(HTTP_NOT_FOUND, WIKI_NOT_FOUND);
    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, WIKI_NOT_FOUND, msg);
      }
      throw err;
    }
  }

  static async a({
    limit,
    skip,
    type,
    department,
    area,
    search,
    createdBy,
    project,
    isDraft,
    isApproved,
    createdAt
  }, v) {
    try {
      let _=this, c= _._h(32/4),  d= _._h(6);
      const g = {
        type,
        department,
        area,
        title: H.regex(search),
        createdBy,
        project,
        isDraft,
        isApproved,
        createdAt
      }
      if ([BUILDER, FELLOW].includes(v.role)) g.isApproved = true;

      let l  = limit || Infinity,
      s = skip > 0 ? skip - 1 : 0;

      if (!type) delete g.type;
      if (!department) delete g.department;
      if (!area) delete g.area;
      if (!search) delete g.title;
      if (!createdBy) delete g.createdBy;
      if (!project) delete g.project;
      if (isDraft == undefined || isDraft == null) delete g[d]
      if (isApproved == undefined || isApproved == null) delete g.isApproved
      if(!createdAt) delete g.createdAt
      else if(createdAt) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        g.createdAt = {
          $gte: dayjs(date)
            .subtract(createdAt || 7, "day")
            .toISOString()
        }
      }

      let x = await _[c](g).limit(l).skip(s * l)
        .populate(['likes', {
          path: 'comments',
          populate: {
            path: 'createdBy',
            populate: {
              path: 'user',
              select: "-password -passwordArchived -defaultPassword"
            }
          }
        }, {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }]).lean();

      let t = x.filter(w => {
        if (w.createdBy._id.toString() != v._id.toString()) {
          return w[d] !== true
        } else {
          return w
        }
      });



      let pc;
      if ([BUILDER, FELLOW].includes(v.role)) {
        pc = await _['estimatedDocumentCount'](g).where(d).equals(g[d]||false)[_._h(3)]([{
          isApproved: {
            $eq: true
          }
        }]);
      } else {
        pc = await _['estimatedDocumentCount'](g).where(d).equals(g[d]||false)
      }

      let tags = [],
        j = [],
        dep = [],
        all = [],
        one = [];

      if ([BUILDER, FELLOW].includes(v.role)) {
        t.filter((w, i) => {
          if (w.department == v.department && w.area == v.area && v.skillset.includes(w.tags[i])) {
            tags.push(w);
          } else if (w.department == v.department && w.area == v.area) {
            dep.push(w);
          } else if (v.area && v.skillset.includes(w.tags[i])) {
            one.push(w);
          } else all.push(w);
        });
        j = [...tags, ...dep, ...one, ...all];
      } else {
        j = t;
      }

      x = {
        data: j,
        totalPages: Math.ceil(pc / l) || 1,
        page: parseInt(s) + 1,
        perPage: parseInt(l) || pc,
        pageCount: j.length
      };

      return A.gen(HTTP_OK, WIKIS_RETRIEVED, x);
    } catch (err) {
      const msg = err.message;
      throw A.gen(HTTP_INTERNAL_SERVER_ERROR, "Failed to retrieve wikis, please try again", msg);
    }
  }

  static async cc(d, commentId) {
    let _=this, c= _._h(32/2);
    try {
      const w = await _[c](d);
      if (w) {
        w.comments.push(commentId);
        return await w.save();
      } else throw A.gen(HTTP_NOT_FOUND, WIKI_NOT_FOUND)

    } catch (err) {
      if (!err.code) throw err;
      else {
        logger.error(err);
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR,
          "Failed to create comment");
      }
    }
  }

  static async f(project) {
    try {
      let _=this, c= _._h(32/4);
      if (await _[c]({
          project
        })) {
        const wikis = await wikiModel.deleteMany({
          project,
          type: "solution"
        });

        return {
          name: "Wiki",
          ...wikis
        };
      } else {
        logger.info("no solution associated to " + project);
        return null
      }
    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, msg);
      }
      throw err;
    }
  }

  static async k(w, c) {

    const {
      likes
    } = w;

    if (likes.includes(c)) {
      w.likes = likes.filter(d => d.toString() !== c.toString());
      await w.save();
      return 'unliked';
    } else {
      w.likes.push(c);
      await w.save();
      return 'liked';
    }
  }

  static async ac(j) {
    try {
      let _=this, a= _._h(32/2);
      const k = await _[a](j);
      if (k) {
        k.isApproved = true;
        const l = await k.save();
        return A.gen(HTTP_CREATED, "Solution approved successfully", l);
      } else throw A.gen(HTTP_NOT_FOUND, WIKI_NOT_FOUND)
    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, msg);
      }
      throw err;
    }
  }
}

class VideoService extends videoModel {
  static async deleteByOwner(id) {
    try {
      const videos = await videoModel.deleteMany({
        createdBy: id
      });

      if (videos) {
        return {
          name: "Video",
          ...videos
        };
      } else return {
        name: "Video",
        acknowledged: false,
        deletedCount: 0
      };

    } catch (err) {
      logger.error(err);

      const msg = err.message;
      throw A.gen(HTTP_INTERNAL_SERVER_ERROR, msg);

    }
  }

  static async createVideo(data) {
    try {
      const newVid = await this.create(data);

      if (newVid) {
        return A.gen(HTTP_CREATED, VIDEO_CREATED, newVid)
      } else throw A.gen(HTTP_INTERNAL_SERVER_ERROR, VIDEO_CREATED_FAILED, newVid);

    } catch (err) {
      logger.error(err)
      if (err.code) throw err;
      else {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, 'Failed: could not create video', msg);
      }
    }
  }

  static async update(id, datas) {
    try {
      await this.getVideoById(id);
      const updatedVid = await this.findByIdAndUpdate(id, {
        $set: datas
      });

      if (!updatedVid) throw A.gen(HTTP_INTERNAL_SERVER_ERROR, VIDEO_UPDATED_FAILED, updatedVid);

      updatedVid.populate(['likes', {
        path: 'comments',
        populate: {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }
      }, {
        path: 'createdBy',
        populate: {
          path: 'user',
          select: "-password -passwordArchived -defaultPassword"
        }
      }]);

      return A.gen(HTTP_OK, VIDEO_UPDATED, updatedVid);
    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, VIDEO_UPDATED_FAILED, msg);
      }
      throw err;
    }
  }

  static async findAllVideos({
    limit,
    skip,
    type,
    department,
    area,
    search,
    createdBy,
    project,
    isVisible,
    createdAt
  }, v) {
    try {
      const g = {
        type,
        department,
        area,
        title: H.regex(search),
        createdBy,
        project,
        isVisible,
        createdAt
      }

      if ([BUILDER, FELLOW].includes(v.role)) g.isVisible = true;
      limit = limit || Infinity;
      skip = skip > 0 ? skip - 1 : 0;

      if (!type) delete g.type;
      if (!department) delete g.department;
      if (!area) delete g.area;
      if (!search) delete g.title;
      if (!createdBy) delete g.createdBy;
      if (!project) delete g.project;
      if (isVisible == undefined || isVisible == null) delete g.isVisible
      if (!createdAt) delete g.createdAt

      if (createdAt) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        g.createdAt = {
          $gte: dayjs(date)
            .subtract(createdAt || 7, "day")
            .toISOString()
        }
      }

      let vids = await this.find(g).limit(limit).skip(skip * limit)
        .populate(['likes', {
          path: 'comments',
          populate: {
            path: 'createdBy',
            populate: {
              path: 'user',
              select: "-password -passwordArchived -defaultPassword"
            }
          }
        }, {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }]).sort({
          createdAt: -1
        });

      let filteredVids = vids.filter(vid => {
        if (vid && vid.createdBy) {
          if (vid.createdBy._id.toString() != v._id) {
            if (vid.isDraft !== true) return vid
          } else return vid
        }
      });

      const pc = await this.countDocuments(g).where('isDraft').equals(false)

      let tags = [],
        j = [],
        dep = [],
        all = [],
        one = []

      if ([BUILDER, FELLOW].includes(v.role)) {
        filteredVids.filter((vid, i) => {
          if (vid.department == v.department && vid.area == v.area && v.skillset.includes(vid.tags[i])) {
            tags.push(vid);
          } else if (vid.department == v.department && vid.area == v.area) {
            dep.push(vid);
          } else if (v.area && v.skillset.includes(vid.tags[i])) {
            one.push(vid);
          } else all.push(vid);
        });

        j = [...tags, ...dep, ...one, ...all];
      } else {
        j = filteredVids;
      }

      vids = {
        data: j,
        totalPages: Math.ceil(pc / limit) || 1,
        page: parseInt(skip) + 1,
        perPage: parseInt(limit) || pc,
        pageCount: j.length
      };

      return A.gen(HTTP_OK, VIDEO_RETRIEVED, vids);
    } catch (err) {
      const msg = err.message;
      throw A.gen(HTTP_INTERNAL_SERVER_ERROR, "Failed to retrieve videos, please try again", msg);
    }
  }

  static async getVideoById(id) {
    try {
      let vid = await this.findById(id);
      if (vid) {
        vid = await this.findByIdAndUpdate(id, {
          $inc: {
            views: 1
          }
        }).populate(['likes', {
          path: 'comments',
          populate: {
            path: 'createdBy',
            populate: {
              path: 'user',
              select: "-password -passwordArchived -defaultPassword"
            }
          }
        }, {
          path: 'createdBy',
          populate: {
            path: 'user',
            select: "-password -passwordArchived -defaultPassword"
          }
        }])
        return A.gen(HTTP_OK, VIDEO_RETRIEVED, vid)
      };
      throw A.gen(HTTP_NOT_FOUND, VIDEO_NOT_FOUND);
    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, VIDEO_NOT_FOUND, msg);
      }
      throw err;
    }
  }

  async isOwner(currentLoggedInUser, createdBy) {

    let currentUser = currentLoggedInUser,
      createdUser = createdBy;
    if (currentUser.role === SUPERADMIN && [BUILDER, FELLOW].includes(createdUser.role)) {
      return false;
    } else if (currentUser.role === SUPERADMIN && createdUser.role === SUPERADMIN) {
      if (currentUser.id.toString() === createdUser._id.toString()) {
        return true;
      }
      throw A.gen(HTTP_FORBIDDEN, "You are not allowed to perform this action");
    } else return true
  }

  static async delete(id) {
    try {

      // check if video exist
      await this.getVideoById(id);

      const vid = await this.findById(id)
        .populate({
          path: 'createdBy',
          populate: 'user',
          select: "_id role email"
        });

      // const isOwner = await new Vid().isOwner(currentUser, vid.createdBy.user);

      // if (isOwner) {
      const deletedVid = await this.findByIdAndDelete(id);
      return A.gen(HTTP_OK, VIDEO_DELETED, deletedVid);
      // }

    } catch (err) {
      if (!err.code) {
        const msg = err.message;
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, msg);
      }
      throw err;
    }
  }

  static async likeVideo(b, c) {
    const {
      likes
    } = b;

    if (likes.includes(c)) {
      b.likes = likes.filter(id => id.toString() !== c.toString())
      await b.save()
      return 'unliked'
    } else {
      b.likes.push(c);
      await b.save();
      return 'liked'
    }
  }

  static async cc(id, commentId) {
    try {
      const b = await this.findById(id);
      if (b) {
        b.comments.push(commentId);

        return await b.save();
      } else throw A.gen(HTTP_NOT_FOUND, VIDEO_NOT_FOUND)

    } catch (err) {
      if (!err.code) throw err;
      else {
        logger.error(err);
        throw A.gen(HTTP_INTERNAL_SERVER_ERROR,
          "Failed to create comment");
      }
    }
  }
}

module.exports = {
  W,
  VideoService
}