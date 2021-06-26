import { 
    Client, 
    quarksToKin, 
    kinToQuarks,
    TransactionType,
    PrivateKey, 
    PublicKey, 
    Environment, 
} from '@kinecosystem/kin-sdk-v2'

const client = new Client(Environment.Test);

export const createAccount = async () => {
    const privateKey = PrivateKey.random();

    try {
        await client.createAccount(privateKey)
        const newTokenAccounts = await client.resolveTokenAccounts(privateKey.publicKey())
        //Dangerously getting the tokenAddress by index
        return {
            privateKey: privateKey.toBase58(),
            publicKey: privateKey.publicKey().toBase58(),
            tokenAddress: newTokenAccounts[0].toBase58()
        }
    } catch (error) {
        return (` Account Creation Failed: ${error}` || "Your Kin account was not created due to an unknown error. Please try again.")
    }
}

export const getAirdrop = async (tokenAccount) => {
        const tokenAccountEncoded = PublicKey.fromBase58(tokenAccount);
        const quarks = kinToQuarks(25)
        try {
            await client.requestAirdrop(tokenAccountEncoded, quarks)
            return "Your Airdrop Has Succeeded. Go to '/balance' to see your extra 25 Kin"
        } catch (error) {
            return (` Airdrop Failed: ${error}` || "Your Airdrop has failed due to an unknown error. Please try again.")
        }
}

export const getAccountBalance = async (publicKey) => {
    try {
        const bigNumberBalance = await client.getBalance(PublicKey.fromBase58(publicKey));
        return quarksToKin(bigNumberBalance)
    } catch (error) {
        return (` Fetching the account balance failed: ${error}`)
    }
}

export const createPayment = async (
    payerPrivateKey, 
    payeePublicKey, 
    amount, 
    memo
) => {
    const p2pTransaction = TransactionType.P2P
    try {
        const paymentResult = await client.submitPayment({
            sender: PrivateKey.fromBase58(payerPrivateKey),
            destination: PublicKey.fromBase58(payeePublicKey),
            type: p2pTransaction,
            memo: memo,
            quarks: kinToQuarks(amount),
        })
        return paymentResult
    } catch (error) {
        return error
    }
}