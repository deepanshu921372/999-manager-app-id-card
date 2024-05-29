const dotenv = require('dotenv');
dotenv.config();

console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

const { sequelizeEMS } = require('../models');
const { Sequelize } = require('sequelize');
const Jimp = require('jimp');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// AWS config
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


// Function to upload to S3
const uploadToS3 = async (filePath) => {
    try {
        const fileData = await Jimp.read(filePath);
        const buffer = await fileData.getBufferAsync(Jimp.MIME_PNG);

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${Date.now().toString()}.png`,
            Body: buffer,
            ContentType: 'image/png'
        };

        const data = await s3Client.send(new PutObjectCommand(params));
        console.log('S3 upload response:', data);
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    } catch (err) {
        console.error('Error uploading to S3:', err);
        throw err;
    }
};


// Function to generate ID card
async function generateIdCard(employee) {
    try {
        // Define file paths
        const templatePath = path.join('./idcard_bg.png');
        const profilePicPath = employee.profilePic;

        // Load images and fonts
        const [template, profilePic, font, fontBold] = await Promise.all([
            Jimp.read(templatePath),
            Jimp.read(profilePicPath),
            Jimp.loadFont(Jimp.FONT_SANS_32_BLACK), // Load font for regular text
            Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)  // Load font for bold text
        ]);

        // Resize profile picture
        const profilePicWidth = 270;
        const profilePicHeight = 320;
        profilePic.resize(profilePicWidth, profilePicHeight);

        // Calculate positions for elements
        const cardWidth = template.bitmap.width;
        const cardHeight = template.bitmap.height;

        const profilePicX = (cardWidth - profilePicWidth) / 2;
        const profilePicY = 250;

        const textStartY = profilePicY + profilePicHeight + 50;
        const lineSpacing = 50;

        // Add profile picture and border to template
        const borderThickness = 4;
        const borderColor = Jimp.cssColorToHex('#87cfce');

        const borderImg = new Jimp(profilePicWidth + 2 * borderThickness, profilePicHeight + 2 * borderThickness, 0xFFFFFFFF);
        borderImg.composite(profilePic, borderThickness, borderThickness);

        const borderX = profilePicX - borderThickness;
        const borderY = profilePicY - borderThickness;

        template.composite(borderImg, borderX, borderY);

        // Add text fields to template
        const centeredText = (text, y, isBold = false) => {
            const fontToUse = isBold ? fontBold : font;
            const textWidth = Jimp.measureText(fontToUse, text);
            const textX = (cardWidth - textWidth) / 2;
            template.print(fontToUse, textX, y, text);
        };

        // Bold font for the name
        const name = employee.name;
        const designation = employee.designation;
        const empId = employee.empID;
        const workBranch = employee.workShift;
        const bloodgroup = employee.bloodgroup || 'Unknown';

        const nameTextWidth = Jimp.measureText(fontBold, name);
        const nameTextX = (cardWidth - nameTextWidth) / 2;
        template.print(fontBold, nameTextX, textStartY, name);

        // Regular text for designation
        centeredText(`${designation}`, textStartY + lineSpacing);

        const infoStartY = textStartY + lineSpacing + 150;
        centeredText(`Emp ID: ${empId}`, infoStartY, true);
        centeredText(`Work Branch: ${workBranch}`, infoStartY + lineSpacing, true);
        centeredText(`Blood Group: ${bloodgroup}`, infoStartY + 2 * lineSpacing, true);

        // Save the final image
        const finalImagePath = path.join('./id_card_final.png');
        await template.writeAsync(finalImagePath);
        console.log('ID card generated successfully.');

        // Upload the generated ID card to S3
        const imageUrl = await uploadToS3(finalImagePath);
        console.log('ID card uploaded to S3 successfully.');
        console.log(`Image URL: ${imageUrl}`);

        return imageUrl;
    } catch (err) {
        console.error('Error generating ID card:', err);
        throw err;
    }
}



exports.registerEmployee = async (req, res) => {
    try {
        const { empID, locID, cID, name, mobile, DOB, designation, workShift, bloodgroup, empType, aadharFront, aadharBack, pan, bankAcctNo, beneficiaryName, ifsc, bankProof, profilePic, jdata } = req.body;

        const employee = {
            empID,
            locID,
            cID,
            name,
            mobile,
            DOB,
            designation,
            workShift,
            bloodgroup,
            empType,
            aadharFront,
            aadharBack,
            pan,
            bankAcctNo,
            beneficiaryName,
            ifsc,
            bankProof,
            profilePic
        };

        const idCardUrl = await generateIdCard(employee);
        employee.idCardUrl = idCardUrl;

        await sequelizeEMS.query(
            `sp_EMS_POST_registerEmployee :empID, :locID, :cID, :name, :mobile, :DOB, :designation, :workShift, :bloodgroup, :empType, :aadharFront, :aadharBack, :pan, :bankAcctNo, :beneficiaryName, :ifsc, :bankProof, :profilePic, :idCardUrl, :jdata`,
            {
                replacements: { ...employee, jdata: JSON.stringify(jdata) },
                type: sequelizeEMS.QueryTypes.RAW
            }
        );

        res.status(200).json({ success: true, message: 'Employee registered successfully', data: employee });
    } catch (error) {
        console.error('Error registering employee:', error);
        res.status(500).json({ success: false, message: 'Failed to register employee', error: error.message });
    }
};
exports.getUsers = async (req, res) => {
    sequelizeEMS.query(
        "sp_EMS_GET_employeeDetails",
        {
            replacements: {},
            type: Sequelize.QueryTypes.SELECT
        }
    ).then(async (result) => {
        res.status(200).json({
            success: true,
            data: result
        });
    })
    .catch((error) => {
        res.status(200).json({
            success: false,
            message: error.message
        });
    });
};

exports.getEmployeeDetails = async (req, res) => {
    try {
        const result = await sequelizeEMS.query(
            "sp_EMS_GET_employeeDetails",
            {
                replacements: {},
                type: Sequelize.QueryTypes.SELECT
            }
        );

        if (result.length > 0) {
            const employee = result[0];
           

            res.status(200).json({
                success: true,
                data: result,
                idCardUrl: imageUrl
            });
        } else {
            res.status(200).json({
                success: false,
                data: 'No employee details found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getEmployeeDetailsByID = async (req, res) => {
    sequelizeEMS.query(
        "sp_EMS_GET_employeeDetailsByID",
        {
            replacements: {},
            type: Sequelize.QueryTypes.SELECT
        }
    ).then(async (result) => {
        res.status(200).json({
            success: true,
            data: result
        });
    })
    .catch((error) => {
        res.status(200).json({
            success: false,
            message: error.message
        });
    });
};

exports.putUpdateEmployeeIDCard = async (req, res) => {
    sequelizeEMS.query(
        "sp_EMS_PUT_updateEmployeeIDCard",
        {
            replacements: {},
            type: Sequelize.QueryTypes.SELECT
        }
    ).then(async (result) => {
        res.status(200).json({
            success: true,
            data: result
        });
    })
    .catch((error) => {
        res.status(200).json({
            success: false,
            message: error.message
        });
    });
};
