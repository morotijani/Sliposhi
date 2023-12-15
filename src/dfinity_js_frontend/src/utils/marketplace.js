import { Principal } from "@dfinity/principal";
import { transferICP } from "./ledger";

// create product and list new products on the marlet
export async function createProduct(product) {
    return window.canister.marketplace.addProduct(product);
}

// retrieve the list of all available products from the marketplace canister
export async function getProducts() {
    try {
        return await window.canister.marketplace.getProducts(); // list of product from marketplace
    } catch (err) {
        // handles potential errors by checking for an "AgentHTTPResponseError" in case of network issues. If such an error occurs, it attempts to log the user out using the authentication client (window.auth.client) to maintain a secure user experience.
        if (err.name === "AgentHTTPResponseError") {
            const authClient = window.auth.client;
            await authClient.logout();
        }
        return [];
    }
}

// purchase products from the marketplace
export async function buyProducts(product) {
    const marketplaceCanister = window.canister.marketplace; // retrieves the marketplace canister instance from window.canister.marketplace.
    const orderResponse = await marketplaceCanister.createOrder(product.id); // initiates the purchase process by calling the createOrder method on the marketplace canister, passing the product ID as a parameter. This creates an order and returns essential details, including the seller’s information and a memo for the transaction.
    const sellerPrimcipal = Principal.from(orderResponse.Ok.seller); // The seller’s principal and address are extracted from the order response.
    const sellerAddress = await marketplaceCanister.getAddressFromPrincipal(sellerPrincipal);
    const block = await transferICP(sellerAddress, orderResponse.Ok.price, orderResponse.ok.memo); // The function calls the transferICP function from the ledger to send the payment to the seller. This step includes details such as the seller’s address, the payment amount, and the memo.
    await marketplaceCanister.completePurchase(sellerPrimcipal, product.id, orderResponse.Ok.price, block, orderResponse.Ok.memo) // After the payment is successfully sent, the function calls completePurchase on the marketplace canister to mark the order as completed. // The user is now the proud owner of the purchased product.
}

