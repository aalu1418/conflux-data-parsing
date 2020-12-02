const contractData = require("./data/contractsCreated_2020-12-01T10:17:06-05:00.json");
const tokenData = require("./data/tokenData_2020-12-01T10:41:14-05:00.json");
const mapData = require("./src/coingeckoTokens.json");
const axios = require("axios");

const getPriceData = async list => {
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
      list.join(",") +
      "&vs_currencies=usd"
  );
  console.log(res.data);
};

const tokenPrice = async data => {
  let tokens = data.map(obj => obj.currency.symbol);
  tokens = [...new Set(tokens)]; // filter out duplicates
  let queryParams = tokens.map(tokens => mapData[tokens]);
  queryParams = [...new Set(queryParams)];
  console.log(queryParams);
  await getPriceData(queryParams);
};

const main = async () => {
  console.log("Contracts deployed: " + String(contractData.length));

  await tokenPrice(tokenData);
  const tokenTxs = tokenData.reduce((total, obj) => total + obj.count, 0);
  console.log("Token transcations: " + tokenTxs);
};

main().catch(e => console.log(e));
