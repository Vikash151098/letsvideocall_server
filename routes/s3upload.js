const { SYSTEM_FAILURE } = require("../config/constant.js");
const { userProviderAdminAuth } = require("../middleware/auth");
const express = require("express");
const config = require("config");
const router = express.Router();
const { userAuth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// For Saving on disk first
const upload = multer({ dest: "./images/uploaded/" });
const singleUpload = upload.single("image");

// For saving directly on S3
var storage = multer.memoryStorage();
var uploadDirect = multer({ storage: storage });

const FileUrl = "https://" + config.get("S3_BUCKET_NAME") + ".s3.amazonaws.com/";

const { uploadFileS3, uploadDirectFileS3 } = require("../services/s3Upload");

router.post("/image-upload-sync", uploadDirect.single("image"), async function (req, res) {
  const dateString = Date.now().toString();
  const Key = dateString + "_" + req.file.originalname;

  var imagePath = "SoloMas/";
  var url = FileUrl + imagePath + "/" + Key;
  let userData = req.body.userData;
  try {
    await uploadDirectFileS3(Key, imagePath, req.file.buffer);
  } catch (Ex) {
    console.log("Exception: ", Ex);
    return handleError(Ex, res);
  }
  res.send({
    statusCode: 200,
    message: "Success",
    data: {
      url,
      userData
    }
  });
});

router.post("/image-upload", userAuth, uploadDirect.single("image"), async function (req, res) {
  const dateString = Date.now().toString();

  const Key = dateString + "_" + req.file.originalname;

  var imagePath = "SoloMas/";
  var url = FileUrl + imagePath + "/" + Key;
  let userData = req.body.userData;

  res.send({
    statusCode: 200,
    message: "Success",
    data: {
      url,
      userData
    }
  });

  try {
    await uploadDirectFileS3(Key, imagePath, req.file.buffer);
  } catch (Ex) {
    console.log("Exception: ", Ex.message);
    return handleError(Ex, res);
  }
});

router.post("/profilePic-upload", uploadDirect.single("image"), async function (req, res) {
  const dateString = Date.now().toString();

  const Key = dateString + "_" + req.file.originalname;

  var imagePath = "SoloMas/";
  var url = FileUrl + imagePath + "/" + Key;
  let userData = req.body.userData;

  res.send({
    statusCode: 200,
    message: "Success",
    data: {
      url,
      userData
    }
  });

  try {
    await uploadDirectFileS3(Key, imagePath, req.file.buffer);
  } catch (Ex) {
    console.log("Exception: ", Ex.message);
    return handleError(Ex, res);
  }
});
const handleError = (err, res) => {
  console.log(err);
  res
    .status(500)
    .contentType("text/plain")
    .end(SYSTEM_FAILURE);
};

module.exports = router;
