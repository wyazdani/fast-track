const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const role = require("../middlewares/role.middleware");
const Roles = require("../enums/role.enum");

router.post("/create-user", role([Roles.ADMIN]), authController.createUser);
router.post("/login", authController.login);

module.exports = router;
