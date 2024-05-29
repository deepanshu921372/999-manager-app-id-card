const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

exports.getPresignedUrl = (req, res) => {
  const { fileName, fileType } = req.query;

  if (!fileName || !fileType) {
    return res.status(400).json({ error: "Missing required query parameters: fileName, fileType" });
  }

  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Expires: 300, // URL expiry time in seconds (5 minutes)
    ContentType: fileType,
  };

  s3.getSignedUrl('putObject', s3Params, (err, url) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error generating presigned URL' });
    }
    res.json({ url });
  });
};
