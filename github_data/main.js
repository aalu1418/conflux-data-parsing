const { Octokit } = require("@octokit/rest");
require("dotenv").config();
const moment = require("moment");
const fs = require("fs");
const octokit = new Octokit({ auth: process.env.GITHUB });

class GithubRepo {
  constructor(owner, repo) {
    this.ownerRepo = { owner, repo };
    this.oneYearAgo = moment()
      .subtract(1, "years")
      .format();
  }

  //get all data
  async getData() {
    console.log(
      "REPOSITORY: " + this.ownerRepo.owner + "/" + this.ownerRepo.repo
    );
    await this.rateLimit();

    console.log("Fetching Stars");
    await this.getStars();

    console.log("Fetching Forks");
    await this.getForks();

    console.log("Fetching Commits");
    await this.getYearlyCommits();

    console.log("Fetching Issues");
    await this.getYearlyIssues();

    console.log("Fetching Lines");
    await this.getLines();
  }

  // show usage stats
  async rateLimit() {
    const raw = await octokit.request("GET /rate_limit");
    raw.data.rate.reset = moment
      .unix(raw.data.rate.reset)
      .format("MMM D YYYY, h:mm:ss a");
    console.log(raw.data.rate);
  }

  // get total number of direct forks (does not include forks of forks)
  async getForks() {
    this.forks = 0;
    await loopPages("GET /repos/{owner}/{repo}/forks", this.ownerRepo, raw => {
      this.forks += raw.data.length;
    });
  }

  // get total number of stars
  async getStars() {
    this.stars = 0;
    await loopPages(
      "GET /repos/{owner}/{repo}/stargazers",
      this.ownerRepo,
      raw => {
        this.stars += raw.data.length;
      }
    );
  }

  // get number of commits the past year
  async getYearlyCommits() {
    const raw = await requestRetry(
      "GET /repos/{owner}/{repo}/stats/commit_activity",
      this.ownerRepo
    );
    this.commits = raw.data.reduce((a, b) => a + b.total, 0);
  }

  // get issues/PRs opened and closed past year
  async getYearlyIssues() {
    let i = 0;
    this.prTotal = 0;
    this.prClosed = 0;
    this.issueTotal = 0;
    this.issueClosed = 0;

    await loopPages(
      "GET /repos/{owner}/{repo}/issues",
      {
        ...this.ownerRepo,
        since: this.oneYearAgo,
        state: "all"
      },
      raw => {
        //filters to calculate each type
        this.prClosed += raw.data.filter(
          obj => obj.pull_request && obj.state === "closed"
        ).length;
        this.prTotal += raw.data.filter(obj => obj.pull_request).length;
        this.issueClosed += raw.data.filter(
          obj => !obj.pull_request && obj.state === "closed"
        ).length;
        this.issueTotal += raw.data.filter(obj => !obj.pull_request).length;
      }
    );
  }

  // get lines of code added and removed over past year
  async getLines() {
    const raw = await requestRetry(
      "GET /repos/{owner}/{repo}/stats/code_frequency",
      this.ownerRepo
    );
    const data = raw.data.slice(-52);
    this.linesAdd = data.reduce((a, b) => a + b[1], 0);
    this.linesDel = data.reduce((a, b) => a + b[2], 0);
  }
}

// data may not be cached, retry after 2 seconds
const requestRetry = async (url, ownerRepo) => {
  let output = await octokit.request(url, ownerRepo);
  if (Number(output.status) == 202) {
    setTimeout(async () => {
      output = await octokit.request(url, ownerRepo);
    }, 2000);
  }

  return output;
};

//loop through multiple pages of data
const loopPages = async (url, params, callback) => {
  let i = 1; //starting with page 1 (page 0 is a duplicate of page 1)
  while (true) {
    const raw = await requestRetry(url, { ...params, per_page: 100, page: i });
    callback(raw);

    //iterate through pages if necessary
    if (raw.data.length < 100) {
      break;
    } else {
      i++;
    }
  }
};

const main = async () => {
  const repoOwner = {
    ethereum: ["go-ethereum", "web3.js"],
    paritytech: ["substrate"],
    "polkadot-js": ["api"],
    cosmos: ["cosmos", "cosmos-sdk"],
    near: ["nearcore", "near-api-js"],
    "conflux-chain": ["conflux-rust", "js-conflux-sdk"]
  };

  //generate filename
  const filename = "data_" + moment().format() + ".json";

  //index over all the repo owners
  for (let ind = 0; ind < Object.keys(repoOwner).length; ind++) {
    const owner = Object.keys(repoOwner)[ind];

    //loop over all the repos associated with owner
    for (let i = 0; i < repoOwner[owner].length; i++) {
      //adding components to form json object
      let prefix = "";
      let suffix = ",";
      if (ind == 0 && i == 0) {
        prefix = "[";
      }
      if (
        ind == Object.keys(repoOwner).length - 1 &&
        i == repoOwner[owner].length - 1
      ) {
        suffix = "]";
      }

      //querying the github api
      const repo = new GithubRepo(owner, repoOwner[owner][i]);
      await repo.getData();
      console.log(repo);

      //writing to file
      fs.appendFile(filename, prefix + JSON.stringify(repo) + suffix, function(
        err
      ) {
        if (err) throw err;
      });
    }
  }
};

main().catch(e => console.log(e));
