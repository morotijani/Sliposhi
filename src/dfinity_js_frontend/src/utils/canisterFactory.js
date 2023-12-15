import { HttpAgent, Actor } from "@dfinity/agent";
// IDL = Interface Description Language
import { idlFactory as marketPlaceIDL } from "../../../declarations/dfinity_js_backend/dfinity_js_backend.did.js";
import { idlFactory as ledgerIDL } from "../../../declarations/ledger_canister/ledger_canister.did.js";


/**
 * Constant variables that store the canister IDs
 * canister IDs are unique identifiers for the canister you want to interact with 
 * and the host URL specifies where your application will communicate with these canister.
 */
const MARKETPLACE_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai";
const LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
//const HOST = "http://localhost:4943";
const HOST = "https://expert-space-carnival-7p4pr4xj6vr2p6vj-4943.app.github.dev";

// Interact with marketplace canister
export async function getMarketplaceCanister() {
    // obtain an instance of the marketplace canister using its canister ID and IDL
    return await getCanister(MARKETPLACE_CANISTER_ID, marketPlaceIDL);
}

export async function getLedgerCanister() {
    // retieve an instance of the ledger canister using its IDand IDL
    return getCanister(LEDGER_CANISTER_ID, ledgerIDL);
}

/**
 * 
 * @param {getCanister} encapsulates the orocess of creating a canister actor 
 * it accepts twi important parameters: the canister uique id and its IDL 
 * 
 */
async function getCanister(canisterId, idl){
    const authClient = window.auth.client;
    const agent = new HttpAgent({
        host: HOST,
        identity: authClient.getIdentity()
    });
    await agent.fetchRootKey(); // this line is needed for the local env only
    return Actor.createActor(idl, {
        agent,
        canisterId,
    });
}

// async function getCanister(canisterId, idl) {
//     const authClient = window.auth.client;
//     const agent = new HttpAgent({
//         host: HOST,
//         identity: authClient.getIdentity()
//     });
//     await agent.fetchRootKey(); // this line is needed for the local env only
//     return Actor.createActor(idl, {
//         agent,
//         canisterId,
//     });
// }