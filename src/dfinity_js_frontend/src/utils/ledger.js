// import { AccountIdentifier } from "@dfinity/nns";

// export async function transferICP(sellerAddress, amount, memo) {
//     const canister = window.canister.ledger;
//     const account = AccountIdentifier.fromHex(sellerAddress);
//     const result = await canister.transfer({
//         to: account.toUint8Array(),
//         amount: { e8s: amount },
//         memo,
//         fee: { e8s: 10000n },
//         from_subaccount: [],
//         created_at_time: []
//     });
//     return result.Ok;
// }

// export async function balance() {
//     const canister = window.canister.ledger;
//     const address = await window.canister.marketplace.getAddressFromPrincipal(window.auth.principal);
//     const balance = await canister.account_balance_dfx({account: address});
//     return (balance?.e8s / BigInt(10**8)).toString();
// }


import { AccountIdentifier } from "@dfinity/nns"; // account identifiers

// Transfer ICP from one account to another
export async function transferICP(sellerAddress, amount, memo) {
    const canister = window.canister.ledger; // obtain an instance of the ledger canister
    const account = AccountIdentifier.fromHex(sellerAddress); // create an AccountIdentifier using the provided sellerAddress
    // initiate the ICP transfer
    const result = await canister.transfer({
        to: account.toUint8Array(), // the address of the account which icp will be transferred.
        amount: { es8: amount }, // the amount of icp to transfer, specified in "e8s" which is the smallest unit in icp
        memo, // a unique identifier for transaction.
        fee: { es8: 10000n },
        from_subaccount: [],
        created_at_time: []
    });
    return result.Ok;
}


// Retrieve the account balance of the currently authenticated user
export async function balance() {
    const canister = window.canister.ledger;
    const address = await window.canister.marketplace.getAddressFromPrincipal(window.auth.principal); // We call the getAddressFromPrincipal function from the marketplace canister to retrieve the user’s account address. This address is necessary for querying the account balance.
    const balance = await canister.account_balance_dfx({account: address}); // use the ledger canister’s account_balance_dfx method to get the balance of the user’s account. The result is an object that contains the balance in “e8s.”
    return (balance?.e8s / BigInt(10**8)).toString(); // To present the balance in a more user-friendly format, we divide the balance by BigInt(10**8) to convert it to ICP. // The function returns the balance as a string, making it suitable for display in the user interface.
}