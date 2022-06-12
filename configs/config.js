if (require('express')().get('env') === "development") {
require("dotenv").config();
}

const environments = {};

environments.production = {
    'env': process.env.NODE_ENV,
    'port': process.env.PORT,
    'host': process.env.HOST+"/"+process.env.VERSION,
    'version': process.env.VERSION,
    'secret': process.env.SECRET,
    'application_name': process.env.APPLICATION_NAME,
    "frontend_host": process.env.FRONTEND_HOST,
    "frontend_dev_host": "http://dev.techchak.com",
    "frontend_admin_host": process.env.FRONTEND_ADMIN_HOST,
    "smtp_secret": process.env.SENDGRID_API_KEY,
    "smtp_user": process.env.SMTP_USER,
    "smtp_from": process.env.FROM_EMAIL,
    "smtp_host": process.env.SMPT_HOST,
    "smtp_reply_to": process.env.SMTP_REPLY_TO,
    "server_key": process.env.SERVER_KEY,
    "server_cert": process.env.SERVER_CERT,
    "mongodb_uri": process.env.MONGODB_URI,
    "mongodb_cert": process.env.MONGODB_CERT,
    'max_file_upload': parseInt(process.env.MAX_FILE_UPLOAD),
    'remove_bg_api_key': process.env.REMOVE_BG_API_KEY,

    'aws_bucket_name': process.env.Bucket,
    'cloudfront_access_key_id': process.env.CLOUDFRONT_ACCESS_KEY_ID,
    "cloudfront_url": process.env.CLOUDFRONT_URL,
    "cloudfront_key_path": process.env.CLOUDFRONT_PRIVATE_KEY_PATH,
};

environments.development = {
    'env': process.env.NODE_ENV,
    'port': process.env.PORT,
    'version': process.env.VERSION,
    'host': process.env.LOCAL_HOST,
    'secret': process.env.SECRET,
    'max_file_upload': parseInt(process.env.MAX_FILE_UPLOAD),
    'application_name': process.env.APPLICATION_NAME,
    "frontend_host": process.env.FRONTEND_LOCAL_HOST,
    "frontend_admin_host": process.env.FRONTEND_ADMIN_LOCAL_HOST,
    "frontend_dev_host": "http://dev.techchak.com",
    
    "smtp_secret": process.env.GMAIL_SECRET,
    "smtp_from": process.env.GMAIL_USER,
    "smtp_user": process.env.GMAIL_USER,
    "smtp_host": process.env.GMAIL_HOST,
    "smtp_reply_to": process.env.GMAIL_REPLY_TO,

    'paystack_secret': process.env.PAYSTACK_SECRET,
    "mongodb_uri": process.env.LOCAL_MONGODB_URI,
    "mongodb_cert": process.env.MONGODB_CERT,

    "server_key": process.env.SERVER_KEY,
    "server_cert": process.env.SERVER_CERT,

    'remove_bg_api_key': process.env.REMOVE_BG_API_KEY,

    'aws_access_key_id': process.env.AWS_ACCESS_KEY_ID,
    'aws_secret_access_key': process.env.AWS_SECRET_ACCESS_KEY,
    'aws_bucket_name': process.env.Bucket,

    'cloudfront_access_key_id': process.env.CLOUDFRONT_ACCESS_KEY_ID,
    "cloudfront_url": process.env.CLOUDFRONT_URL,
    "cloudfront_key_path": process.env.CLOUDFRONT_PRIVATE_KEY_PATH,
    
    "pg_user": "postgres",
    "pg_host": "localhost",
    "pg_database": process.env.PG_DATABASE,
    "pg_password": process.env.PG_PASSWORD,
    "pg_port": 5432
}

module.exports =  environments[process.env.NODE_ENV];
