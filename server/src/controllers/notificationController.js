const Notification = require("../models/Notification");

// @desc    Get user notifications and unread count
// @route   GET /api/notifications
// @access  Private
const getMyNotifications = async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30),
      Notification.countDocuments({ recipient: req.user._id, isRead: false }),
    ]);

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: "Notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationsRead,
};
