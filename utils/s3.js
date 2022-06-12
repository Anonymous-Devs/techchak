const fs = require('fs')
const AWS = require('aws-sdk');
const awsCloudFront = require('aws-cloudfront-sign');
const path = require("path");
const config = require("../configs/config");
let s3Cfg = {
        accessKeyId: config.aws_access_key_id,
        secretAccessKey: config.aws_secret_access_key,
    },
    s3;
if (config.env == "development") {
    s3 = new AWS.S3({
        ...s3Cfg,
        correctClockStew: true
    })
} else {
    s3 = new AWS.S3({
        correctClockStew: true,
    })
}
exports.uploadImageFile = async (options) => {
    const {
        file,
        filename,
        mimeType
    } = options;
    const theFile = fs.readFileSync(file);
    const bucketData = {
        Bucket: config.aws_bucket_name,
        Key: filename,
        Body: theFile,
        ContentType: mimeType,
    }
    const a = await s3.upload(bucketData).promise();
    const resp = {
        url: a.Location,
        data: a
    }
    return resp;
}
exports.uploadBase64ImageFile = async (options) => {
    const {
        file,
        filename,
        mimeType
    } = options;
    const buff = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const bucketData = {
        Bucket: config.aws_bucket_name,
        Key: filename,
        Body: buff,
        ContentEncoding: 'base64',
        ContentType: mimeType,
        ContentDisposition: 'inline'

    }
    const a = await s3.upload(bucketData).promise();
    const resp = {
        url: a.Location
    }
    return resp;
}
// const keyPath = path.resolve(process.env.CLOUDFRONT_PRIVATE_KEY_PATH);
// let p = fs.readFileSync(keyPath).toString()
// //console.log(p)
// exports.getFileLink = (filename) => {
// console.log(process.env.FRONTEND_HOST, filename)
//     return new Promise(function (resolve, reject) {
//       let options = { keypairId: process.env.CLOUDFRONT_ACCESS_KEY_ID, privateKeyPath:keyPath };
//       let signedUrl = awsCloudFront.getSignedUrl(process.env.FRONTEND_HOST + filename, options);
//       resolve(signedUrl);
//     });
//   }
exports.getFileLink = (filename) => {
    return new Promise(function (resolve, reject) {
        var options = {
            keypairId: config.cloudfront_access_key_id,
            privateKeyPath: path.resolve(config.cloudfront_key_path)
        };
        var signedUrl = awsCloudFront.getSignedUrl(config.cloudfront_url + filename, options);
        resolve(signedUrl);
    });
}