const { MIDDLEWARE_AUTH_CONSTANTS } = require("../config/constant.js");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const { Admin } = require("../models/admin");
const { User } = require("../models/user");
// const { Provider } = require("../models/provider");

userAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;

    if (decoded.role !== "user")
      return res
        .status(403)
        .send({ statusCode: 403, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN });
    let user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
    if (!user || (user && user.accessToken !== token))
      return res
        .status(401)
        .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
    req.userData = user;

    next();
  } catch (ex) {
    res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.INVALID_AUTH_TOKEN });
  }
};

adminAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;

    if (decoded.role !== "admin")
      return res
        .status(403)
        .send({ statusCode: 403, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN });
    let admin = await Admin.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
    if (!admin )
      return res
        .status(401)
        .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
    next();
  } catch (ex) {
    res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.INVALID_AUTH_TOKEN });
  }
};

providerAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;

    if (decoded.role !== "provider")
      return res
        .status(403)
        .send({ statusCode: 403, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN });
    let provider = await Provider.findOne({ _id: mongoose.Types.ObjectId(decoded.providerId) });
    if (!provider || (provider && provider.accessToken !== token))
      return res
        .status(401)
        .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
    req.providerData = provider;

    next();
  } catch (ex) {
    res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.INVALID_AUTH_TOKEN });
  }
};

userAdminAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;

    if (decoded.role === "user") {
      let user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
      if (!user || (user && user.accessToken !== token))
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
      req.userData = user;
    } else if (decoded.role === "admin") {
      let admin = await Admin.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
      // || (admin && admin.accessToken !== token)
      if (!admin )
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
    } else {
      return res
        .status(403)
        .send({ statusCode: 403, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN });
    }

    next();
  } catch (ex) {
    console.log(ex);
    res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
  }
};

providerAdminAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;

    if (decoded.role === "provider") {
      let provider = await Provider.findOne({ _id: mongoose.Types.ObjectId(decoded.providerId) });
      if (!provider || (provider && provider.accessToken !== token))
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
      req.providerData = provider;
    } else if (decoded.role === "admin") {
      // || (admin && admin.accessToken !== token)
      let admin = await Admin.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
      if (!admin)
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
    } else {
      return res
        .status(403)
        .send({ statusCode: 403, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN });
    }

    next();
  } catch (ex) {
    console.log(ex);
    res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
  }
};

userProviderAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;

    if (decoded.role === "provider") {
      let provider = await Provider.findOne({ _id: mongoose.Types.ObjectId(decoded.providerId) });
      if (!provider || (provider && provider.accessToken !== token))
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
      req.providerData = provider;
    } else if (decoded.role === "user") {
      let user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
      if (!user || (user && user.accessToken !== token))
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
      req.userData = user;
    } else {
      return res
        .status(403)
        .send({ statusCode: 403, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN });
    }

    next();
  } catch (ex) {
    console.log(ex);
    res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
  }
};

userProviderAdminAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("Authorization");
  if (!token)
    return res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;

    if (decoded.role === "provider") {
      let provider = await Provider.findOne({ _id: mongoose.Types.ObjectId(decoded.providerId) });
      if (!provider || (provider && provider.accessToken !== token))
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
      req.providerData = provider;
    } else if (decoded.role === "user") {
      let user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
      if (!user || (user && user.accessToken !== token))
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
      req.userData = user;
    } else if (decoded.role === "admin") {
      let admin = await Admin.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
      //|| (admin && admin.accessToken !== token)
      if (!admin )
        return res
          .status(401)
          .send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
    } else {
      return res
        .status(403)
        .send({ statusCode: 403, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN });
    }

    next();
  } catch (ex) {
    console.log(ex);
    res.status(401).send({ statusCode: 401, message: "Failure", data: MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED });
  }
};

module.exports.userAuth = userAuth;
module.exports.adminAuth = adminAuth;
module.exports.providerAuth = providerAuth;
module.exports.userAdminAuth = userAdminAuth;
module.exports.providerAdminAuth = providerAdminAuth;
module.exports.userProviderAuth = userProviderAuth;
module.exports.userProviderAdminAuth = userProviderAdminAuth;
