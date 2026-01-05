const router = require("express").Router();
const ctrl = require("../controllers/claim.controller");

router.post("/", ctrl.submitClaim);
router.get("/", ctrl.getAllClaims);
router.get("/:id", ctrl.getClaim);

router.post("/:id/approve", ctrl.approveClaim);
router.post("/:id/reject", ctrl.rejectClaim);

router.post("/:id/finalize", ctrl.finalizeClaim);

module.exports = router;
