const contractData = require("./data/contractsCreated_2020-12-01T10:17:06-05:00.json");
const tokenData = require("./data/tokenData_2020-12-01T10:41:14-05:00.json");

const main = async () => {
  console.log("Contracts deployed: " + String(contractData.length));
  const tokenTxs = tokenData.reduce((total, obj) => total + obj.count, 0);
  console.log("Token transcations (not including CFX): "+tokenTxs);
};

main().catch(e => console.log(e));
