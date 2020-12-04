const { gql } = require("graphql-request");
const { get, write } = require("./src/utils.js");
const moment = require("moment");

query = gql`
  query(
    $network: ConfluxNetwork!
    $limit: Int!
    $offset: Int!
    $from: ISO8601DateTime
    $till: ISO8601DateTime
  ) {
    conflux(network: $network) {
      blocks(
        options: { desc: "count", limit: $limit, offset: $offset }
        date: { since: $from, till: $till }
      ) {
        address: miner {
          address
          annotation
        }
        count
        min_date: minimum(of: date)
        max_date: maximum(of: date)
      }
    }
  }
`;

//main loop to cycle through all transactions
const main = async () => {
  const spacing = 1000;
  let ind = 0;
  let individual = {};
  let total;

  const res = await get(
    query,
    "2020-01-01",
    0,
    1000,
    "2020-12-31"
  );

  total = res.conflux.blocks;

  const from = moment("2020-01-01", "YYYY-MM-DD");
  const till = moment("2020-01-08", "YYYY-MM-DD");
  for (let i = 0; i < 52; i++) {
    console.log(from.format("YYYY-MM-DD"), till.format("YYYY-MM-DD"));
    const res = await get(
      query,
      from.format("YYYY-MM-DD"),
      0,
      100,
      till.format("YYYY-MM-DD")
    );


    from.add(1, "weeks");
    till.add(1, "weeks");

    res.conflux.blocks.forEach(obj => {
      if (individual[obj.address.address] == undefined) {
        individual[obj.address.address] = Array(52).fill(0);
      }

      individual[obj.address.address][i] = obj.count;
    });
  }

  //writing to file
  write("mining", {total, individual});
};

main().catch(error => console.error(error));
