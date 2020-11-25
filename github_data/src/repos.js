const { Octokit } = require("@octokit/rest");
require("dotenv").config();
const moment = require("moment");
const octokit = new Octokit({ auth: process.env.GITHUB });
const { requestRetry, loopPages } = require("./utils.js");

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

  async getContributors() {
    const raw = await requestRetry(
      "GET /repos/{owner}/{repo}/stats/contributors",
      this.ownerRepo
    );
    this.contributors = raw.data;
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

module.exports = { GithubRepo };
