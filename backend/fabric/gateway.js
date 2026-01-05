const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

let contract; // singleton

async function getContract() {
    if (contract) return contract;

    const tlsCert = await fs.readFile(process.env.TLS_CERT_PATH);
    const client = new grpc.Client(
        process.env.PEER_ENDPOINT,
        grpc.credentials.createSsl(tlsCert),
        { 'grpc.ssl_target_name_override': process.env.PEER_HOST_ALIAS }
    );

    const certFile = (await fs.readdir(process.env.CERT_DIRECTORY_PATH))[0];
    const keyFile = (await fs.readdir(process.env.KEY_DIRECTORY_PATH))[0];

    const identity = {
        mspId: process.env.MSP_ID,
        credentials: await fs.readFile(
            path.join(process.env.CERT_DIRECTORY_PATH, certFile)
        ),
    };

    const privateKey = crypto.createPrivateKey(
        await fs.readFile(
            path.join(process.env.KEY_DIRECTORY_PATH, keyFile)
        )
    );

    const gateway = connect({
        client,
        identity,
        signer: signers.newPrivateKeySigner(privateKey),
        hash: hash.sha256,
    });

    const network = gateway.getNetwork(process.env.CHANNEL_NAME);
    contract = network.getContract(process.env.CHAINCODE_NAME);

    return contract;
}

module.exports = { getContract };
