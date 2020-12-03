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
      transfers(
        options: { desc: "count", limit: $limit, offset: $offset }
        amount: { gt: 0 }
        date: { since: $from, till: $till }
      ) {
        currency {
          symbol
          address
        }
        count
        senders: count(uniq: senders)
        receivers: count(uniq: receivers)
        days: count(uniq: dates)
        from_date: minimum(of: date)
        till_date: maximum(of: date)
        amount
      }
    }
  }
`;

//main loop to cycle through all transactions
const main = async () => {
  const spacing = 1000;
  let ind = 0;
  let output = [];
  const data = {};

  while (true) {
    const res = await get(query, "2020-01-01", ind, 1000);
    output = [...output, ...res.conflux.transfers]; //adding data to array

    //trigger for breaking loop
    const returnLength = res.conflux.transfers.length;

    if (returnLength < spacing) {
      break;
    } else {
      ind += spacing;
    }
  }

  data["yearly"] = output;


  output = [];
  const from = moment("2020-01-01", "YYYY-MM-DD");
  const till = moment("2020-01-08", "YYYY-MM-DD");
  for (let i = 0; i < 52; i++) {
    console.log(from.format("YYYY-MM-DD"), till.format("YYYY-MM-DD"));
    const res = await get(
      query,
      from.format("YYYY-MM-DD"),
      0,
      1000,
      till.format("YYYY-MM-DD")
    );

    from.add(1, "weeks");
    till.add(1, "weeks");

    if (res.conflux.transfers.length == 0) {
      output.push(0);
    } else {
      const amount = res.conflux.transfers.reduce((a, b) => a + b.count, 0);
      output.push(amount);
    }
  }
  data["weekly"] = output;

  //writing to file
  write("tokenData", data)
};

main().catch(error => console.error(error));
