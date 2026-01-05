#!/bin/bash
set -e   # exit if any command fails

# Move into test-network folder
cd test-network

echo "Stopping existing network..."
./network.sh down

echo "Starting network and creating channel..."
./network.sh up createChannel -c claims-channel -ca

echo "Deploying chaincode..."
./network.sh deployCC -c claims-channel -ccn claim-contract -ccp ../chaincode/claims/ -ccl javascript

# Move back to root folder
cd ..

echo "All steps completed."