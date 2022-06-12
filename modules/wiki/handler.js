const s3Upload = require('../../utils/file_upload/s3UploadAdaptor');
const ApiResponse = require('../../utils/http.response');
const {
  W
} = require('../../services/wikiAndVideo.service'), {
    logger
  } = global,
  
  ProjectService = require('../../services/project.service'),
  r = require('../../services/comment.service'),
  PortfolioService = require('../../services/portfolio.service'),
  p = require('../../services/profile.service');

const {
  FELLOW
} = require("../../utils/role")

const {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_BAD_REQUEST
} = require('../../utils/http.response.code');


exports.c = async (f, w) => {
  try {
    if (f.image) {
      const wImg = await s3Upload({
        folder: 'wiki',
        file: f.image
      })
      f.image = wImg;
    }
    const d = await W.c(f, w);
    return d;

  } catch (err) {
    if (err._message === 'Validation failed') throw ApiResponse.gen(HTTP_BAD_REQUEST, err.message)
    if (err.code) throw err
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, 'could not create wiki');
  }
}

exports.v = async (o, m) => {
  const s = await W.v(o, m);
  return s;
}

exports.g = async (o) => {
  const wiki = await W.g(o);
  return wiki;
}
exports.m = async function (q, d) {
  const z = await p[g(null,64/4)](d["pid"]);
  z.role = d.role;
  q = q || {};
  q.skip = q.offset;
  delete q.offset;
  const wiki = await W.a(q, z);

  return wiki;
}

exports.d = async (a, z, b) => {
  const y = await W.e(a, z, b),c=y["data"];
  if (y.code) {
    await r.deleteMany({
      type: "wiki",
      wiki: a
    });

    if (c.type == "solution" && z.role == FELLOW) {
      PortfolioService.decreaseTotalCompletedProject(c.createdBy, c.project)
    }
    if (c.type == "solution") {
      c._doc.project = await ProjectService.detachSolution(a, c.project);
    }

    return y;
  }
}

exports.k = async (j, {pid}) => {
  try {
    const h = await W[g(null,32/2)](j);
    j=pid;
    if (h) {
      const resp = await W.k(h, j);
      if (resp == 'liked') return {
        code: 201,
        message: "Post liked successfully",
        data: h
      };
      else return {
        code: 200,
        message: "Post unliked successfully",
        data: h
      };
    } else throw {
      code: 404,
      message: "Post not found"
    };
  } catch (e) {
    logger.error(e)
    if (e.code) throw e;
    else throw {
      code: 500,
      message: "Internal server error",
      data: e
    };
  }
}

exports.ac = async (sd, pid) => {

    const c = await W.ac(sd);
    if (c.code) {
      await PortfolioService.findOneAndUpdate({user: c["data"].createdBy}, {$inc: {totalCapstoneCompleted: 1}})
      return c;
    }

}

const sl="ninja4",
g = helper[sl];