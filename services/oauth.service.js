
const {
 request
} = require('../utils/request'), {
   clientId,
   clientSecret,
   redirectUri,
   scope,
   client_url
 } = require('../utils/oauth.data'),
 config = require('../configs/config'),
 http = require('http'),
 fs = require('fs'),
 path = require('path');
 
module.exports = class OAUTH {
 /******** LINKEDIN FLOW *******/

 static async authorizeLinkedinUser() {
  const response = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${config.secret}&scope=${scope}`;

  return response
 }

 static async getUserAccessToken(code) {
  let url = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`

  try {
   const res = await request({
    endpoint: url,
    method: 'POST',
    headers: {
     'Content-Type': 'application/x-www-form-urlencoded'
    }
   })

   // console.log(res.data)
   return res.data
  } catch (err) {
   throw {
    code: 400,
    message: "Authentication failed, please restart the process."
   }
  }

 }

 static async getLinkedinUser(accessToken) {
  let url = `https://api.linkedin.com/v2/me`
  const response = await request({
   endpoint: url,
   method: 'GET',
   headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Bearer ${accessToken}`
   }
  }).then(async res => {
   return res.data
  }).catch(err => {
   logger.error(err);
  })

  // console.log(response)
  return response
 }

 static async registerImage(accessToken, URN) {
  try {
   let imgRegisteredBody = {
    "registerUploadRequest": {
     "recipes": [
      "urn:li:digitalmediaRecipe:feedshare-image"
     ],
     "owner": `urn:li:person:${URN}`,
     "serviceRelationships": [{
      "relationshipType": "OWNER",
      "identifier": "urn:li:userGeneratedContent"
     }]
    }
   };

   const url = "https://api.linkedin.com/v2/assets?action=registerUpload";

   const response = await request({
    endpoint: url,
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${accessToken}`,
     'X-Restli-Protocol-Version': '2.0.0'
    },
    data: imgRegisteredBody
   }).then(res => {

    const {
     value
    } = res.data;

    // console.log(value);
    const {
     uploadUrl
    } = value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'];
    // console.log(uploadUrl, value.asset);
    return {
     uploadUrl,
     asset: value.asset
    }
   }).catch(err => {
    logger.error(err);
    throw {
     code: 500,
     message: "Failed to register image"
    };
   })

   return response
  } catch (err) {
    loggers.error(err)
   throw err
  }
 }

 static async uploadImage(accessToken, {
  imgUrl,
  uploadUrl
 }) {
  try {

   // imageUploadUrl = "https://api.linkedin.com/v2/assets?action=uploadAuxiliary";


   const filePath = './uploads/tmp/img.png';
   const file = fs.createWriteStream(filePath);
   let encodedImage;
   http.get(imgUrl, (response) => {
    response.pipe(file);
   });

   let result = file.on('finish', async (err) => {
    if (err) {
     console.log(err);
    }
    // Encode to base64
    encodedImage = fs.readFileSync(path.resolve(filePath), 'base64');
    // encodedImage = Buffer.from( 'base64');
    // console.log(encodedImage);


    const res = await request({
     endpoint: uploadUrl,
     method: 'POST',
     headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0'
     },
     data: {
      "uploadUrl": uploadUrl,
     }

    }).then(res => {
     // console.log(res.data);
     return res.data
    }).catch(err => {
     logger.error(err);
     throw {
      code: 500,
      message: "Failed to upload image"
     }
    });

    return res
   })

   return result
  } catch (err) {
    loggers.error(err)
  }
 }

 static async sharePostToLinkedin(accessToken, URN, data) {
  // console.log(accessToken, URN)

  try {
   const imgUrl = "http://ds20de4grf4xk.cloudfront.net/backend-uploads/project/1650239975662_project"

   const {
    uploadUrl,
    asset
   } = await this.registerImage(accessToken, URN);

   await this.uploadImage(accessToken, {
    imgUrl,
    uploadUrl
   });
   const postUrl = "https://api.linkedin.com/v2/ugcPosts"
   // imageRegisterUrl = ,

   // q=urn:li:ugcPost:${URN}
   // console.log(uploadUrl, asset);
   const shareBody = {
    "author": `urn:li:person:${URN}`,
    "lifecycleState": "PUBLISHED",
    "specificContent": {
     "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
       "text": `My first post shared from a nodejs application.

                 #nodejs #techchak #developer`
      },
      "shareMediaCategory": "IMAGE",
      "media": [{
       "status": "READY",
       "description": {
        "text": "Cool Stuff!"
       },
       "media": asset,
       "title": {
        "text": "Shared post from nodejs API"
       }
      }]
     }
    },
    "visibility": {
     "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS"
    }
   }


   const res = await request({
    endpoint: postUrl,
    method: 'POST',
    headers: {
     // 'Content-Type': 'application/json',
     'Authorization': `Bearer ${accessToken}`,
     'X-Restli-Protocol-Version': '2.0.0'
    },
    data: shareBody,
   }).then(res => {

    return res.data
   }).catch(err => {
    loggers.error(err)
    throw {
     code: 500,
     message: "Failed to share post"
    }
   });

   return res

  } catch (err) {
   console.log(err);
  }
 }

}