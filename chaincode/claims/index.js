/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const claimContract = require('./lib/claim-contract');

module.exports.claimContract = claimContract;
module.exports.contracts = [claimContract];
