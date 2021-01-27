const express = require("express");
const router = express.Router();

const {validate} = require("../contollers/validate");

router.post('/validate-rule',validate);

module.exports = router;