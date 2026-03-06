const express = require("express");
const router = express.Router();

const { getTechs } = require("../controllers/techsController");

router.get("/", getTechs);

module.exports = router;