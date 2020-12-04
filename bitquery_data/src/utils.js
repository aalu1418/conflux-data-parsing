const { request } = require("graphql-request");
const fs = require("fs");
const moment = require("moment");

// call the bitquery endpoint
const get = async (
  query,
  from = null,
  offset = 0,
  limit = 100,
  till = null
) => {
  const endpoint = "https://graphql.bitquery.io";
  const variables = {
    limit,
    offset,
    network: "conflux_tethys",
    from,
    till
  };

  return await request(endpoint, query, variables);
};

const write = (filename, output) => {
  fs.appendFile(
    "./data/" + filename + "_" + moment().format() + ".json",
    JSON.stringify(output),
    function(err) {
      if (err) throw err;
    }
  );
};

module.exports = { get, write };
