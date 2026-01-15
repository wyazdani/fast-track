const { getContract } = require("../fabric/gateway");
const expressAsyncHandler = require("express-async-handler");
const utf8Decoder = new TextDecoder();

const generateClaimId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000); // 0–9999
  return `CLAIM-${timestamp}-${random}`; // e.g., 'CLAIM-1700000000000-4821'
};

exports.submitClaim = expressAsyncHandler(async (req, res) => {
  const contract = await getContract();

  const claim = {
    ...req.body,
    id: generateClaimId(),
    status: "SUBMITTED",
    createdAt: new Date().toISOString(),
  };
  console.log({ claim });
  try {
    await contract.submitTransaction("SubmitClaim", JSON.stringify(claim));
    res.json({ message: "Claim submitted" });
  } catch (error) {
    console.error("Transaction error:", error);
    console.error("Error details:", error.details || error.message);
    throw error;
  }
});

exports.getClaim = expressAsyncHandler(async (req, res) => {
  const contract = await getContract();
  const resultBytes = await contract.evaluateTransaction(
    "GetClaim",
    req.params.id
  );
  const resultJson = utf8Decoder.decode(resultBytes);
  const claim = JSON.parse(resultJson);
  res.json({ claim });
});

exports.getAllClaims = expressAsyncHandler(async (req, res) => {
  const contract = await getContract();
  const resultBytes = await contract.evaluateTransaction("GetAllClaims");
  const resultJson = utf8Decoder.decode(resultBytes);
  const claims = JSON.parse(resultJson);
  res.json({ claims });
});

exports.approveClaim = expressAsyncHandler(async (req, res) => {
  const contract = await getContract();
  const ress = await contract.submitTransaction("ApproveClaim", req.params.id, req.user.id);
  console.log({ress})
  res.json({ message: "Claim approved" });
});

exports.rejectClaim = expressAsyncHandler(async (req, res) => {
  const contract = await getContract();
  await contract.submitTransaction("RejectClaim", req.params.id, req.user.id, req.body.reason);
  res.json({ message: "Claim rejected" });
});

exports.finalizeClaim = expressAsyncHandler(async (req, res) => {
  const contract = await getContract();
  await contract.submitTransaction("FinalizeClaim", req.params.id, req.user.id);
  res.json({ message: "Claim finalized" });
});
