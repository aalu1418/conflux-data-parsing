const { Octokit } = require("@octokit/rest");
require("dotenv").config();
const moment = require("moment");
const fs = require("fs");
const { GithubRepo } = require("./repos.js");
const octokit = new Octokit({ auth: process.env.GITHUB });
const { requestRetry, loopPages } = require("./utils.js");

class GithubTopic {
  constructor(topic) {
    this.topic = topic;
    this.oneYearAgo = moment()
      .subtract(1, "years")
      .format();
    this.userA = {};
    this.userD = {};
    this.userC = {};
    this.repositories = 0;
  }

  async search() {
    const q = "topic:"+this.topic;
    try {
      const raw = await loopPages(
        "GET /search/repositories",
        {
          mediaType: {
            previews: ["mercy"]
          },
          q,
          per_page: 100,
          page: 1,
          sort: "stars"
        },
        async raw => {
          this.repositories = raw.data.total_count; //add total repositories
          const repos = raw.data.items.map(repo => repo.full_name.split("/"));
          for (let i = 0; i < repos.length; i++) {
            const repo = new GithubRepo(repos[i][0], repos[i][1]);
            if (i == 0) {
              await repo.rateLimit(); // get rate limit (occasional)
            }
            console.log(repos[i]);

            await repo.getContributors(); // get contributors
            repo.contributors.forEach(contributor => {
              const weeks = contributor.weeks.slice(-52); //get past 52 weeks (1 year)

              // set up 0 for addition
              if (this.userA[contributor.author.login] == undefined) {
                this.userA[contributor.author.login] = 0;
                this.userD[contributor.author.login] = 0;
                this.userC[contributor.author.login] = 0;
              }

              //add totals from repos
              this.userA[contributor.author.login] += weeks.reduce(
                (a, b) => a + b.a,
                0
              );
              this.userD[contributor.author.login] += weeks.reduce(
                (a, b) => a + b.d,
                0
              );
              this.userC[contributor.author.login] += weeks.reduce(
                (a, b) => a + b.c,
                0
              );
            });
          }
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = { GithubTopic };
