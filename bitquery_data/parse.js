const contractData = require("./data/contractsCreated_2020-12-01T10:17:06-05:00.json");
const { yearly } = require("./data/tokenData_2020-12-03T17:15:36-05:00.json");
const mapData = require("./src/coingeckoTokens.json");
const axios = require("axios");

const getPriceData = async list => {
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
      list.join(",") +
      "&vs_currencies=usd"
  );
  return res.data;
};

const tokenPrice = async data => {
  let tokens = data.map(obj => obj.currency.symbol);
  tokens = [...new Set(tokens)]; // filter out duplicates
  let queryParams = tokens.map(tokens => mapData[tokens]);
  queryParams = [...new Set(queryParams)];
  return await getPriceData(queryParams);
};

const main = async () => {
  const tokenData = yearly;
  const pricing = await tokenPrice(tokenData);
  const tokenTxs = tokenData.reduce((total, obj) => total + obj.count, 0);

  const skipped = [];
  const values = tokenData.map(obj => {
    let value = obj.amount;

    if (pricing[mapData[obj.currency.symbol]] == undefined) {
      skipped.push(obj.currency.symbol);
      return 0;
    }

    value *= pricing[mapData[obj.currency.symbol]].usd;
    return value;
  });

  const valueSum = values.reduce((a, b) => a + b, 0);

  console.log("Tokens with no price match:", [...new Set(skipped)]);
  console.log("Contracts deployed: " + String(contractData.length));
  console.log("Token transcations: " + tokenTxs);
  console.log("Token transaction value (USD): " + valueSum.toLocaleString());
};

main().catch(e => console.log(e));
