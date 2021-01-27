const express = require("express");
const router = express.Router();

const {getDetails} = require("../contollers/base");

router.get("/",getDetails);

module.exports = router;