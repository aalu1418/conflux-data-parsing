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
    this.repositories = 0;
    this.weekly = {
      a: new Array(52).fill(0),
      d: new Array(52).fill(0),
      c: new Array(52).fill(0)
    };
    this.user = {};
  }

  async search() {
    //parse specifiers
    const parameters = this.topic.split("+")
    this.topic = parameters[parameters.length - 1];
    parameters[parameters.length - 1] = "topic:"+parameters[parameters.length - 1]
    const q = parameters.join("+");
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
              if (this.user[contributor.author.login] == undefined) {
                this.user[contributor.author.login] = {
                  a: new Array(52).fill(0),
                  d: new Array(52).fill(0),
                  c: new Array(52).fill(0)
                };
              }

              for (let i = 1; i <= weeks.length; i++) {
                ["a", "d", "c"].forEach(param => {
                  this.user[contributor.author.login][param][52 - i] +=
                    weeks[weeks.length - i][param];
                  this.weekly[param][52 - i] += weeks[weeks.length - i][param];
                });
              }
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
