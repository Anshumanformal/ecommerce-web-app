const router = require("express").Router();
const UserRoutes = require("./User");
const AdminRoutes = require("./Admin");

router.use("/user", UserRoutes);
router.use("/admin", AdminRoutes);

module.exports = router;
