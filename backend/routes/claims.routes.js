const router = require("express").Router();
const ctrl = require("../controllers/claim.controller");
const role = require("../middlewares/role.middleware");
const { validateClaim } = require("../middlewares/validation.middleware");
const Roles = require("../enums/role.enum");

router.post("/", role([Roles.HOSPITAL_USER]), validateClaim, ctrl.submitClaim);
router.get("/", role([Roles.HOSPITAL_USER, Roles.ADMIN, Roles.AUDITOR]), ctrl.getAllClaims);
router.get(
  "/:id",
  role([Roles.HOSPITAL_USER, Roles.ADMIN, Roles.AUDITOR]),
  ctrl.getClaim
);

router.post("/:id/approve", role([Roles.INSURER_REVIEWER]), ctrl.approveClaim);
router.post("/:id/reject", role([Roles.INSURER_REVIEWER]), ctrl.rejectClaim);

router.post("/:id/finalize", role([Roles.ADMIN]), ctrl.finalizeClaim);

module.exports = router;
