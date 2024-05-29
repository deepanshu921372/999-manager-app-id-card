const express = require('express');
const aws = require('aws-sdk');
const router = express.Router();

// Load environment variables from .env file
require('dotenv').config();

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.get('/get-presigned-url', (req, res) => {
  const { fileName, fileType } = req.query;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'Missing required query parameters: fileName, fileType' });
  }

  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read',
  };

  s3.getSignedUrl('putObject', s3Params, (err, url) => {
    if (err) {
      console.error('Error generating presigned URL', err);
      return res.status(500).json({ error: 'Error generating presigned URL' });
    }

    res.json({ url });
  });
});

module.exports = router;
