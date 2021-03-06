const { Octokit } = require("@octokit/rest");
require("dotenv").config();
const octokit = new Octokit({ auth: process.env.GITHUB });
const fs = require("fs");

// data may not be cached, retry after 2n seconds
const requestRetry = async (url, ownerRepo) => {
  let output;
  const max = 10;
  for (let i = 0; i < max; i++){
    output = await octokit.request(url, ownerRepo);
    if (Number(output.status) == 202) {
      if (i == max-1) {
        console.log("Request Retry failed");
        break;
      }
      await pause(2000*(i+1));
    } else {
      break;
    }
  }

  return output;
};

//loop through multiple pages of data
const loopPages = async (url, params, callback) => {
  let i = 1; //starting with page 1 (page 0 is a duplicate of page 1)
  while (true) {
    const raw = await requestRetry(url, { ...params, per_page: 100, page: i });
    await callback(raw);

    //iterate through pages if necessary
    let length = raw.data.length;
    if (length == undefined ) {
      length = raw.data.items.length;
    }

    if (length < 100) {
      break;
    } else {
      i++;
    }
  }
};

//input time in ms
const pause = s =>
  new Promise((res, rej) => {
    setTimeout(() => res(), s);
  });

//inputs: condition for open bracket, condition for closed bracket, function that returns desired output, filename
const printer = async (openBracket, closeBracket, func, filename) => {
  //adding components to form json object
  let prefix = "";
  let suffix = ",";
  if (openBracket) {
    prefix = "[";
  }
  if (closeBracket) {
    suffix = "]";
  }

  const output = await func();

  //writing to file
  fs.appendFile(filename, prefix + JSON.stringify(output) + suffix, function(
    err
  ) {
    if (err) throw err;
  });
};

module.exports = { requestRetry, loopPages, printer };
