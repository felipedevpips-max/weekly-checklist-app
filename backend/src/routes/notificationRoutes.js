const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/send", authMiddleware, notificationController.sendNotification);
router.get("/status", authMiddleware, notificationController.getNotificationStatus);

module.exports = router;