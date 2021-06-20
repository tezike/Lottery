const assert = require("assert")
const ganache = require("ganache-cli")
const Web3 = require("web3")
const web3 = new Web3(ganache.provider())

const { interface, bytecode } = require("../compile")

let accounts
let lottery

beforeEach(async () => {
    accounts = await web3.eth.getAccounts()

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: "1000000"})
})

describe("Lottery Contract", ()=> {
    it("Has deployed a contract", () => {
        assert.ok(lottery.options.address)
    })

    it("address added on enter", async () => {
        await lottery.methods.enter().send(
            {from: accounts[0],
             value: web3.utils.toWei("0.02", "ether")
            })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        // console.log(players)
        assert.strictEqual(accounts[0], players[0])
        assert.strictEqual(1, players.length)
    })

    it("allows multiple accounts", async () => {
        await lottery.methods.enter().send(
            {from: accounts[0],
             value: web3.utils.toWei("0.02", "ether")
            })
        
        await lottery.methods.enter().send(
            {from: accounts[1],
                value: web3.utils.toWei("0.02", "ether")
            })
        
        await lottery.methods.enter().send(
            {from: accounts[2],
                value: web3.utils.toWei("0.02", "ether")
            })
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        // console.log(players)
        // console.log(accounts)
        assert.strictEqual(accounts[0], players[0])
        assert.strictEqual(accounts[1], players[1])
        assert.strictEqual(accounts[2], players[2])
        assert.strictEqual(3, players.length)
    })

    it("Sends enough ether", async () => {
        try{
            await lottery.methods.enter().send(
                {from: accounts[0],
                value: web3.utils.toWei("0.0001", "ether")
                })
            // sanity
            assert(false)
        } catch (err) {
            assert(err)
        }
    })

    it("Ensure only manager can pick winner ", async () => {
        try{
            await lottery.methods.pickWinner().send(
                {from: accounts[1]})
            assert(false)
        } catch(err){
            assert(err)
        }
    })

    it("It sends money to the winner and resets the players array", async () => {
        await lottery.methods.enter().send(
            {from: accounts[0],
             value: web3.utils.toWei("0.02", "ether")
            })

        // await lottery.methods.enter().send(
        //     {from: accounts[1],
        //         value: web3.utils.toWei("0.02", "ether")
        //     })

        const initialBalance = await web3.eth.getBalance(accounts[0])

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        })

        assert.strictEqual(accounts[0])
        
    })
})