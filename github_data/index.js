const { GithubRepo } = require("./src/repos.js");
const { GithubTopic } = require("./src/devs.js");
const { printer } = require("./src/utils.js");
const moment = require("moment");
const fs = require("fs");

const repos = async () => {
  const repoOwner = {
    ethereum: ["go-ethereum", "web3.js"],
    paritytech: ["substrate"],
    "polkadot-js": ["api"],
    cosmos: ["cosmos", "cosmos-sdk"],
    near: ["nearcore", "near-api-js"],
    "conflux-chain": ["conflux-rust", "js-conflux-sdk"]
  };

  //generate filename
  const filename = "./data/repos_" + moment().format() + ".json";

  //index over all the repo owners
  for (let ind = 0; ind < Object.keys(repoOwner).length; ind++) {
    const owner = Object.keys(repoOwner)[ind];

    //loop over all the repos associated with owner
    for (let i = 0; i < repoOwner[owner].length; i++) {
      await printer(
        ind == 0 && i == 0,
        ind == Object.keys(repoOwner).length - 1 &&
          i == repoOwner[owner].length - 1,
        async () => {
          const repo = new GithubRepo(owner, repoOwner[owner][i]);
          await repo.getData();
          console.log(repo);
          return repo;
        },
        filename
      );
    }
  }
};

const devsPull = async () => {
  const topics = ["conflux", "nearprotocol", "polkadot", "cosmos", "ethereum"];
  const filename = "./data/devs_" + moment().format() + ".json";

  for (let i = 0; i < topics.length; i++) {
    await printer(
      i == 0,
      i == topics.length - 1,
      async () => {
        const devs = new GithubTopic(topics[i]);
        await devs.search();
        console.log(
          "-------------",
          topics[i],
          devs.repositories,
          "-------------"
        );
        return devs;
      },
      filename
    );
  }
};

// repos().catch(e => console.log(e));
devsPull().catch(e => console.log(e));
