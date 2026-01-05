"use strict";

const { Contract } = require("fabric-contract-api");
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const ClaimStatus = require("../enums/claimStatus.enum");

class ClaimContract extends Contract {
  async SubmitClaim(ctx, claimJson) {
    const claim = JSON.parse(claimJson);
    claim.docType = "claim";
    claim.status = ClaimStatus.SUBMITTED;
    claim.history = claim.history || [];

    await ctx.stub.putState(
      claim.id,
      Buffer.from(stringify(sortKeysRecursive(claim)))
    );
  }

  async GetClaim(ctx, id) {
    const data = await ctx.stub.getState(id);
    if (!data || data.length === 0) {
      throw new Error("Claim not found");
    }
    return data.toString();
  }

  async GetAllClaims(ctx) {
    const iterator = await ctx.stub.getStateByRange("", "");
    const claims = [];
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      if (record.docType == "claim") claims.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(claims);
  }

  async ApproveClaim(ctx, id, userId) {
    const claim = await this._getClaim(ctx, id);
    claim.status = ClaimStatus.APPROVED;
    this._addHistoryEntry(ctx, claim, ClaimStatus.APPROVED, userId);
    await this._save(ctx, claim);
  }

  async RejectClaim(ctx, id, userId, reason) {
    const claim = await this._getClaim(ctx, id);
    claim.status = ClaimStatus.REJECTED;
    claim.rejectionReason = reason;
    this._addHistoryEntry(
      ctx,
      claim,
      ClaimStatus.REJECTED,
      userId,
      "REJECTION"
    );
    await this._save(ctx, claim);
  }

  async FinalizeClaim(ctx, id, userId) {
    const claim = await this._getClaim(ctx, id);
    claim.status = ClaimStatus.FINALIZED;
    this._addHistoryEntry(ctx, claim, ClaimStatus.FINALIZED, userId);
    await this._save(ctx, claim);
  }

  async _getClaim(ctx, id) {
    const data = await ctx.stub.getState(id);
    if (!data || data.length === 0) throw new Error("Not found");
    return JSON.parse(data.toString());
  }

  async _save(ctx, claim) {
    try {
      const result = await ctx.stub.putState(
        claim.id,
        Buffer.from(stringify(sortKeysRecursive(claim)))
      );
      console.log("save result", result);
    } catch (error) {
      console.log("save error", error);
    }
  }

  _addHistoryEntry(ctx, claim, action, userId, from) {
    if (!claim.history) {
      claim.history = [];
    }

    const txTime = ctx.stub.getTxTimestamp();
    const timestamp = new Date(txTime.seconds.low * 1000).toISOString();

    const historyEntry = {
      action: action,
      userId,
      createdAt: timestamp,
    };

    if (from == "REJECTION")
      historyEntry.rejectionReason = claim.rejectionReason;

    claim.history.push(historyEntry);

    console.log({ "updated claim": claim });
  }
}

module.exports = ClaimContract;
