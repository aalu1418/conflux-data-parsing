const { gql } = require("graphql-request");
const { get, write } = require("./src/utils.js");

// graphql query
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

//main loop to cycle through all transactions
const main = async () => {
  const spacing = 1000;
  let ind = 0;
  let output = [];

  while (true) {
    const res = await get(query, "2020-01-01", ind, 1000);
    // check if contract created and filtering
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

    output = [...output, ...newContracts]; //adding data to array

    //trigger for breaking loop
    const returnLength = res.conflux.transactions.length;

    if (returnLength < spacing) {
      break;
    } else {
      ind += spacing;
    }
  }

  //writing to file once loop complete
  write("contractsCreated", output)
};

main().catch(error => console.error(error));
