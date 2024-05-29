const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { Readable } = require("stream");
const dotenv = require('dotenv');

dotenv.config();

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Function to upload image to S3
exports.uploadImage = async (req, res) => {
  try {
    console.log(req.files.image)
    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: 'No image file was uploaded.' });
    }

    const image = req.files.image;
    const fileName = Date.now() + '-' + image.name;

    // Create a Readable stream from the image buffer
    const stream = new Readable();
    stream.push(image.data);
    stream.push(null);

    // Set up parameters for S3 upload
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: stream,
        ContentType: image.mimetype
      },
    });

    // Upload image to S3
    const result = await upload.done();
    
    // If upload is successful, construct image URL
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log(imageUrl)
    // Return success response with image URL
    res.status(200).json({ success: true, imageUrl: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
};
