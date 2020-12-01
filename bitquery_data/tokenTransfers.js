const { gql } = require("graphql-request");
const { get, write } = require("./src/utils.js");

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

  //writing to file once loop complete
  write("tokenData", output)
};

main().catch(error => console.error(error));
