import {Client, Environment, quarksToKin} from '@kinecosystem/kin-sdk-v2'
import {createAccount, getAirdrop, getAccountBalance, createPayment} from "./helpers.js"
import express from "express"
import bs58 from 'bs58';

const kinApp = express()
const port = process.env.PORT || 8080

const client = new Client(Environment.Test);
kinApp.use(express.json())

kinApp.get('/account', async (req,res) => {
    const newAccountDetails = await createAccount()
    res.send(newAccountDetails)
})

kinApp.get('/airdrop', async (req,res) => {
    const tokenAddress = req.query.tokenAddress
    const result = await getAirdrop(tokenAddress)
    res.send(result)
})

kinApp.get('/balance', async (req,res) => {
    const publicKey = req.query.publicKey
    const balance = await getAccountBalance(publicKey)
    res.send(`You currently have ${balance} Kin.`)
})

kinApp.post('/pay', async (req, res) => {
        const { privateKey, publicKey, amount, memo } = req.body
        //TODO: Add ability to receive transaction type
        const result = await createPayment(privateKey, publicKey, amount, memo)
        const txData = await client.getTransaction(result);
        //TODO: Understand whether it's possible to have more than one item in this array
        const { sender, destination, quarks } = txData.payments[0]
        const kinTotal = quarksToKin(quarks)
        const txMessage = `${kinTotal} Kin was sent to '${destination.toBase58()}' from '${sender.toBase58()}'. The transaction ID is '${bs58.encode(txData.txId)}'.`
        res.send(`Transaction Info: ${txMessage}`)
})

kinApp.listen(port, () => {
    console.log(`Kin goodness at http://localhost:${port}`)
})