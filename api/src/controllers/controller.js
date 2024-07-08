const {Provider,Contract, Account} = require('fuels') 
const { readFileSync } = require('fs') 


exports.controller = async(req, res) => {
    const provider = await Provider.create("https://testnet.fuel.network/v1/graphql")
    const account = new Account("0x1608bb193d2aa8288fbfbb033499a3e7563029b81d702b31a2851621be8741ec", provider)
    const contractId = "0xf46b7c0b0e0fb07d3870c0d3466a894f4362889d366808aae77646981cbca5ad"
    const abiPath = "D:\\Griffy\\node-api\\api\\contract_abi.json"
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));
    const contract = new Contract(contractId,abi,account)
    
    const result = await contract.functions.total_assets().call()
    console.log(result)
    res.json({ message: 'This is sample data' });
}