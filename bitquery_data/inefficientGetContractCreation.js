const { request, gql } = require("graphql-request");
const fs = require("fs");

const get = async (from, offset, limit = 100) => {
  const endpoint = "https://graphql.bitquery.io";
  const variables = {
    limit,
    offset,
    network: "conflux_tethys",
    from,
    till: null
  };

  const query = gql`
    query(
      $network: ConfluxNetwork!
      $limit: Int!
      $offset: Int!
      $from: ISO8601DateTime
      $till: ISO8601DateTime
    ) {
      conflux(network: $network) {
        transactions(
          options: {
            desc: ["block.height", "to.address"]
            limit: $limit
            offset: $offset
          }
          date: { since: $from, till: $till }
        ) {
          block {
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
            height
          }
          hash
          creates {
            address
          }
          to {
            address
          }
        }
      }
    }
  `;

  return await request(endpoint, query, variables);
};

const main = async () => {
  const spacing = 1000;
  let ind = 0;
  let output = [];

  while (true) {
    const res = await get("2020-01-01", ind, 1000);
    // check if contract created
    const newContracts = res.conflux.transactions.filter(
      obj => !!obj.creates.address
    );

    console.log(
      "Current Block Height: " +
        String(res.conflux.transactions[0].block.height) +
        "       Filtered through: " +
        String(ind) +
        " transactions       Found " +
        String(newContracts.length) +
        " contracts created"
    );

    output = [...output, ...newContracts];

    //trigger for breaking loop
    const returnLength = res.conflux.transactions.length;

    if (returnLength < spacing) {
      break;
    } else {
      ind += spacing;
    }
  }

  //writing to file
  fs.appendFile("test.json", JSON.stringify(output), function(err) {
    if (err) throw err;
  });
};

main().catch(error => console.error(error));
