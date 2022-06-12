'use strict';

const s3Upload = require('../../utils/file_upload/s3UploadAdaptor'),
  s3 = require('../../utils/file_upload/s3UploadAdapt'),
  ApiResponse = require('../../utils/http.response'),
  REMOVEBG = require('../../utils/removebg'),
  fs = require('fs'),
  path = require('path');
const {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
  HTTP_NOT_FOUND,
} = require('../../utils/http.response.code');
const {
  UPLOAD_DENIED,
  AVATAR_UPLOADED,
  ACCOUNT_NOT_FOUND,
} = require('../../utils/http.response.message');

const AccountService = require('../../services/account.service');
const ProfileService = require('../../services/profile.service');
const SYSTEM = require('../../services/system.service');
const PortfolioService = require('../../services/portfolio.service');
const ColorUtil = require('../../utils/department.color');
const { W } = require('../../services/wikiAndVideo.service');
const { FELLOW } = require('../../utils/role');

exports.getLoggedInUser = async (locals) => {
  const { id, role } = locals;
  const account = await AccountService.getAccountById(id);
  const profile = await ProfileService.getProfileByAccountId({
    user: id,
    role,
  });

  account.data = profile;
  return account;
};

exports.getUserById = async (req) => {
  const { id } = req.params;
  let { filter } = req.query;

  if (filter) {
    const dataRequested = filter.split(',');
    // ensures password related request doesn't come in
    filter = dataRequested.filter((item) => {
      return item != 'password' && item != 'passwordArchived';
    });
  }

  const account = await AccountService.getAccountById(id, filter);

  if (account.data) {
    const profile = await ProfileService.getProfileByAccountId({
      user: id,
      role: account.data.role,
    });

    const pid = profile._id;
    const { data } = await PortfolioService.getPortfolioByUserId(pid);

    const arr = [];
    data.personal.filter((item) => {
      if (item.status.toLowerCase() == 'in progress') arr.push(item);
    });
    data.capstone.filter((item) => {
      if (item.status.toLowerCase() == 'in progress') arr.push(item);
    });
    data.team.filter((item) => {
      if (item.status.toLowerCase() == 'in progress') arr.push(item);
    });

    let currentlyWorkingOn = [];

    if (arr.length) {
      for (let project of arr) {
        if (currentlyWorkingOn.length <= 1) {
          currentlyWorkingOn.push(project);
        }
      }
    }

    const filter = {
      type: {
        $nin: ['solution'],
      },
      isDraft: false,
      createdBy: pid,
    };
    const wikis = await W.find(filter);

    const portfolio = {
      totalProjectCompleted: data.totalProjectCompleted,
      totalCapstoneCompleted: data.totalCapstoneCompleted,
      totalWikisCreated: wikis.length,
      totalCollabos: 0,
      currentlyWorkingOn,
      createdWikis: wikis.filter((data, index) => {
        if (index <= 3) return data;
      }),
    };

    profile.portfolio = portfolio;

    account.data = profile;

    return account;
  } else throw ApiResponse.gen(HTTP_NOT_FOUND, ACCOUNT_NOT_FOUND);
};

exports.deleteUserById = async (id) => {
  const account = await AccountService.deleteAccount(id);

  // digest deleted users accounts id
  await SYSTEM.digest(account.data._id);

  delete account.data;
  // deletes all users data
  SYSTEM.ejectUser();
  return account;
};

exports.updateAccount = async (body) => {
  let data;
  if (Object.keys(body).includes('password')) {
    data = await AccountService.updateAccount(body.id, body.data);
  } else
    data = await ProfileService.updateProfileById(
      {
        id: body.id,
        role: body.role,
      },
      body.data
    );

  return data;
};

exports.uploadImage = async ({ id, role, pid }, body) => {
  try {
    // const tempFilePath = path.resolve("uploads/tmp"),
    //   fileName = tempFilePath.concat('/removebg.png');
    //   const { department } = await ProfileService.getProfileByAccountId({user: id, filter: "department"});

    // if (role === FELLOW) {
    //   const result = await new REMOVEBG({
    //     uploadType: "base64",
    //     bgColor: ColorUtil.getByDepartment(department),
    //   }).removeBackground(body.file, fileName);

    //   if (result) {
    //     body.file = "data:image/png;base64,\n"+fs.readFileSync(path.resolve(fileName), 'base64');
    //   }
    // }
    const pImg = await s3Upload({
      folder: 'profile',
      file: body.file,
    });
    const avat = await ProfileService.updateAvatar(id, pImg);
    return ApiResponse.gen(HTTP_OK, AVATAR_UPLOADED, avat);
  } catch (err) {
    if (err.code) throw err;
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, UPLOAD_DENIED);
  }
};

exports.uploadCoverImage = async (id, body) => {
  try {
    const cImage = await s3Upload({
      folder: 'cover',
      file: body.file,
    });
    const cover = await ProfileService.updateCoverImage(id, cImage);
    return ApiResponse.gen(HTTP_OK, 'Cover image uploaded successfully', cover);
  } catch (err) {
    if (err.code) throw err;
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, UPLOAD_DENIED);
  }
};

exports.uploadCv = async (id, req) => {
  try {
    const pCv = await s3(req.files.file, 'cv');
    const cv = await ProfileService.updateCv(id, pCv);
    return ApiResponse.gen(HTTP_OK, 'Resume uploaded successfully', cv);
  } catch (err) {
    if (err.code) throw err;
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, UPLOAD_DENIED);
  }
};

exports.getAllUsers = async (body) => {
  if (body.offset) {
    body.skip = parseInt(body.offset);
    delete body.offset;
  } else {
    body.skip = 0;
  }

  const users = await AccountService.getAllUsers(body);
  return users;
};

exports.updateApplicationStatus = async (id, status) => {
  const data = await AccountService.updateApplicationStatus(id, status);
  return data;
};

exports.updateUserChatStatus = async (id, onlineStatus) => {
  const data = await AccountService.updateUserChatStatus(id, onlineStatus);
  return data;
};

exports.toggleUserApproval = async (id) => {
  const data = await AccountService.toggleUserApproval(id);
  return data;
};

exports.getActiveUsers = (query) => {
  const result = AccountService.getActiveUsers(query);
  return result;
};

exports.upgradeUser = async (id, body) => {
  const user = await AccountService.upgradeUser(id, body);
  return user;
};
