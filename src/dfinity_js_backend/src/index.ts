// canister code goes here

// Import necessary Libraries
import { query, update, text, Record, StableBTreeMap, Variant, Vec, None, Some, Ok, Err, ic, Principal, Opt, nat64, Duration, Result, bool, Canister } from "azle";
import { Ledger, binaryAddressFromAddress, binaryAddressFromPrincipal, hexAddressFromPrincipal } from "azle/canisters/ledger";
const { hashCode } = require("hashcode");
// import { hashCode } from "hashcode";
import { v4 as uuidv4 } from "uuid";

/**
 * Store product data
 * contacins basic properties that are needed to define a product
 * Represents a product that can be listed on a marketplace
 */
const Product = Record ({
    id: text, // unique identifier
    title: text, // product title
    description: text, // detailed product description
    location: text, // product origin or shipping address
    price: nat64, // product price in natural numbers
    seller: Principal, // identity of product seller
    attachmentURL: text, // for option urls that provide additional product information or images
    soldAmount: nat64, // amount of product that has been sold,
    createdAt: nat64,
    updatedAt: Opt(nat64) 
});

/**
 * Record types
 * Payload or Data
 * Data needed when creating a product
 * Will be used when users add new products to marketplace
 */
const ProductPayload = Record({
    title: text,
    description: text,
    location: text,
    price: nat64,
    attachmentURL: text
});

/**
 * Ordr record and OrderStatus
 * for tracking and managing orders within the marketplace
 */

// Describes status of an Order
const OrderStatus = Variant({
    PaymentPending: text,
    Completed: text 
});

// An order in the marketplace
const Order = Record({
    productId: text,
    price: nat64,
    status: OrderStatus,
    seller: Principal, // identity of the seller
    paid_at_block: Opt(nat64), //to record the block when payment was made (option is Optional)
    memo: nat64, // additional order information
    createdAt: nat64,
    updatedAt: Opt(nat64) 
});

/**
 * Message variant
 * Representing messages or responses within the marketplace
 * conveying information and feedback to users and clients of the marketplace smart contract
 */
const Message = Variant({
    NotFound: text,
    InvalidPayload: text,
    PaymentFailed: text,
    PaymentCompleted: text
});

/**
 * productsStorage` - it's a key-value data structure used to store products listed by sellers in the marketplace.
 * {@link StableBTreeMap} is a self-balancing tree acting as durable data storage that preserves data across canister upgrades.
 * For this contract, we've chosen {@link StableBTreeMap} for several reasons:
 * - `insert`, `get`, and `remove` operations have a constant time complexity of O(1).
 * - Data stored in this map persists across canister upgrades, unlike using a HashMap where data is stored in the heap and can be lost after a canister upgrade
 */
const productsStorage = StableBTreeMap(text, Product, 0);

/**
 * `persistedorders` and `pendingOrders` are also instances of {@link StableBTreeMap}.
 * These data structures are used to manage and store orders within the marketplace.
 */
const persistedOrders = StableBTreeMap(Principal, Order, 1);
const pendingOrders = StableBTreeMap(nat64, Order, 2)

/**
 * `ORDER_RESERVATION_PERIOD`
 * a constant that defines the reservation period for orders in seconds.
 * This period allows users to reserve products for a specific durstion before completingthe purchase
 */
const ORDER_RESERVATION_PERIOD = 120n;

/**
 * Initialization pf the Ledger canister, which handles financial transaction and ledger operations
 * The principal text value is hardcoded here, as it is set in the `dfx.json` configuration.
 */
const icpCanister = Ledger(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"));

// IMPLEMENTING THE BODY OF OUR CANISTER //
export default Canister({

    /**
     * Retrieve all producst available in the marketplace
     * Returns list of products from `productsStorage`
     */
    getProducts: query([], Vec(Product), () => {
        return productsStorage.values();
    }),

    /**
     * Get orders
     * Return all orders from `persistedOrders`.
     */
    getOrders: query([], Vec(Order), () => {
        return persistedOrders.values();
    }),

    /**
     * Get pending orders
     * Returns all pending order from `pendingOrders`
     */
    getPendingOrders: query([], Vec(Order), () => {
        return pendingOrders.values();
    }),

    // Managing products within the marketplace smart contract //

    // Get product
    getProduct: query([text], Result(Product, Message), (id) => {
        const productOpt = productsStorage.get(id);
        if ("None" in productOpt) {
            return Err({ NotFound: `product with id=${id} not found` });
        }
        return Ok(productOpt.Some);
    }),

    // Add Product
    addProduct: update([ProductPayload], Result(Product, Message), (payload) => {
        if (typeof payload !== "object" || Object.keys(payload).length === 0) {
            return Err({ NotFound: "Invalid payload" })
        }
        const product = { id: uuidv4(), soldAmount: 0n, seller: ic.caller(), createdAt: ic.time(), updatedAt: None, ...payload };
        productsStorage.insert(product.id, product);
        return Ok(product);
    }),

    // Update Product
    updateProduct: update([Product], Result(Product, Message), (payload) => {
        // const productOpt = productsStorage.get(payload.id);
        // if ("None" in productOpt) {
        //     return Err({ NotFound: `cannot update product: product with id=${payload.id} not found` });
        // }
        // productsStorage.insert(productOpt.Some.id, payload);
        // return Ok(payload);

        const productOpt = productsStorage.get(payload.id);
        if ("None" in productOpt) {
            return Err({ NotFound: `cannot update product: product with id=${payload.id} not found` });
        }
        const product = productOpt.Some;
        const updateProduct = { ...product, ...payload, updatedAt: Some(ic.time()) }
        productsStorage.insert(product.id, updateProduct);
        return Ok(payload);

    }),

    // Delete Product
    deleteProduct: update([text], Result(text, Message), (id) => {
        const deletedProductOpt = productsStorage.remove(id);
        if ("None" in deletedProductOpt) {
            return Err({ NotFound: `cannot delete the product: product with id=${id} not found` });
        }
        return Ok(deletedProductOpt.Some.id);
    }),


    emptyProducts: update([], Result(text, Message), () => {
        return Ok(productsStorage.remove());
    }),

    // Order Management //

    /*
        on create order we generate a hashcode of the order and then use this number as corelation id (memo) in the transfer function
        the memo is later used to identify a payment for this particular order.

        The entire flow is divided into the three main parts:
            1. Create an order
            2. Pay for the order (transfer ICP to the seller). 
            3. Complete the order (use memo from step 1 and the transaction block from step 2)
            
        Step 2 is done on the FE app because we cannot create an order and transfer ICP in the scope of the single method. 
        When we call the `createOrder` method, the ic.caller() would the principal of the identity which initiated this call in the frontend app. 
        However, if we call `ledger.transfer()` from `createOrder` function, the principal of the original caller won't be passed to the 
        ledger canister when we make this call. 
        In this case, when we call `ledger.transfer()` from the `createOrder` method,
        the caller identity in the `ledger.transfer()` would be the principal of the canister from which we just made this call - in our case it's the marketplace canister.
        That's we split this flow into three parts.

    * discardByTimeout: to discard the order after a certain period of time. this is done to prevent users from reserving products for too long
    */

    createOrder: update([text], Result(Order, Message), (id) => {
        const productOpt = productsStorage.get(id);
        if ("None" in productOpt) {
            return Err({ NotFound: `cannot create the order: product=${id} not found` });
        }
        const product = productOpt.Some;
        const order = {
            productId: product.id,
            price: product.price,
            status: { PaymentPending: "PAYMENT_PENDING" },
            seller: product.seller,
            paid_at_block: None,
            memo: generateCorrelationId(id), // generates a correlation ID for the order which has passed to the memo. use to identity the order when making payment
            createdAt: ic.time(), 
            updatedAt: None
        };
        pendingOrders.insert(order.memo, order);
        discardByTimeout(order.memo, ORDER_RESERVATION_PERIOD);
        return Ok(order);
    }),

    /**
     * Complete Purchase
     * this function is responsible for completing orders within he marketplace smart contract
     */
    completePurchase: update([Principal, text, nat64, nat64, nat64], Result(Order, Message), async (seller, id, price, block, memo) => {
        // check for payment with memo
        const paymentVerified = await verifyPaymentInternal(seller, price, block, memo);
        if (!paymentVerified) {
            return Err({ NotFound: `cannot complete purchase: cannot verify the payment, memo=${memo}` });
        }
        // check for pending order
        const pendingOrderOpt = pendingOrders.remove(memo);
        if ("None" in pendingOrderOpt) {
            return Err({ NotFound: `cannot complete the purchase: there is no pending order with id=${id}` });
        }
        // find product and store to orders
        const order = pendingOrderOpt.Some;
        const updatedOrder = { ...order, status: { Completed: "COMPLETED" }, paid_at_block: Some(block) };
        const productOpt = productsStorage.get(id);
        if ("None" in productOpt) {
            throw Error(`product with id=${id} not found`);
        }
        const product = productOpt.Some;
        product.soldAmount += 1n; // update product soldAmount
        productsStorage.insert(product.id, product);
        persistedOrders.insert(ic.caller(), updatedOrder);
        return Ok(updatedOrder);
    }),

    // VERIFYING AND MAKING PAYMENTS //
    /*
        another example of a canister-to-canister communication
        here we call the `query_blocks` function on the ledger canister
        to get a single block with the given number `start`.
        The `length` parameter is set to 1 to limit the return amount of blocks.
        In this function we verify all the details about the transaction to make sure that we can mark the order as completed
    * Communicates with the ledger canister to verify the payment details of a completed order.
    */
    verifyPayment: query([Principal, nat64, nat64, nat64], bool, async (reciever, amount, block, memo) => {
        return await verifyPaymentInternal(reciever, amount, block, memo);
    }),

    /**
     * Get address from the principal
     * the address is later used in the transfer method
     */
    getAddressFromPrincipal: query([Principal], text, (principal) => {
        return hexAddressFromPrincipal(principal, 0);
    }),

    /**
     * Make payment
     * an update method used to initiate a payment transaction from the marketplace canister to a specific recipient
     * converts reciepent's address from text to a Principal, crucial for addressing canister identities
     * calculates the transfer fee and initiates the payment transaction through the ledger canister usingin the ic.call function
     */
    
    // not used right now. can be used for transfers from the canister for instances when a marketplace can hold a balance account for users
    makePayment: update([text, nat64], Result(Message, Message), async (to, amount) => {
        const toPrincipal = Principal.fromText(to);
        const toAddress = hexAddressFromPrincipal(toPrincipal, 0);
        const transferFeeResponse = await ic.call(icpCanister.transfer_fee, { args: [{}] });
        const transferResult = ic.call(icpCanister.transfer, {
            args: [{
                memo: 0n,
                amount: {
                    e8s: amount
                },
                fee: {
                    e8s: transferFeeResponse.transfer_fee.e8s
                },
                from_subaccount: None,
                to: binaryAddressFromAddress(toAddress),
                created_at_time: None
            }]
        });
        if ("Err" in transferResult) {
            return Err({ PaymentFailed: `payment failed, err=${transferResult.Err}` });
        }
        return Ok({ PaymentCompleted: "payment completed" });
    })
});
// HELPER FUNCTIONS //

/*
* Hash function
* is used to generate correlation ids for orders.
* also, we use that in the verifyPayment function where we check if the used has actually paid the order
*/
function hash(input: any): nat64 {
    return BigInt(Math.abs(hashCode().value(input)));
};

// a work around to make uuid package work with azle
globalThis.crypto = { 
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};

// Generate Correlation Ids for orders, which combines the product id, the caller's principal (identity), and the current timestamp to form a unique identifier.
function generateCorrelationId(productId: text): nat64 {
    const correlationId = `${productId}_${ic.caller().toText()}_${ic.time()}`;
    return hash(correlationId);
}

/*
* after the order is created, we give the `delay` amount of minutes to pay for the order.
* if it's not paid during this timeframe, the order is automatically removed from the pending orders.
*/
function discardByTimeout(memo: nat64, delay: Duration) {
    ic.setTimer(delay, () => {
        const order = pendingOrders.remove(memo);
        console.log(`Order discarded ${order}`);
    })
}

/**
 * Verify Payment
 * Responsible for verifying payments within the marketplace smart contract
 * Communicates with the ledger conister to retrieve trnsactiondetails and verify the payment's validity
*/
async function verifyPaymentInternal(reciever: Principal, amount: nat64, block: nat64, memo: nat64): Promise<bool> {
    const blockData = await ic.call(icpCanister.query_blocks, { args: [{ start: block, length: 1n }] });
    const tx = blockData.blocks.find((block) => {
        if ("None" in block.transaction.operation) {
            return false;
        }
        const operation = block.transaction.operation.Some;
        const senderAddress = binaryAddressFromPrincipal(ic.caller(), 0);
        const recieverAddress = binaryAddressFromPrincipal(reciever, 0);
        return block.transaction.memo === memo && hash(senderAddress) === hash(operation.Transfer?.from) && hash(recieverAddress) === hash(operation.Transfer?.to) && amount === operation.Transfer?.amount.e8s;
    });
    return tx ? true : false;
};
