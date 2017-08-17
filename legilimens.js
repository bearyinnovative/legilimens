const request = require('request');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('.config.json','utf8'));

const GITHUB_REPO_API_ROOT = "https://api.github.com/repos/";
const RELEASES_PATH = "/releases";
const RECENT_CLOSED_PR_PATH = "/pulls?state=closed&sort=updated&direction=desc";

const { username, password } = config;
const repoPath = config.repo_path;
const baseBranch = process.argv[2] || config.repo_branch || 'master';
const isHotfix = !!process.argv[2];

const repoUrl = `${GITHUB_REPO_API_ROOT}${repoPath}`;

function callGithubAPI({url, callback}) {
  request({
    url,
    headers: {
     'User-Agent': 'request'
    },
    auth: {
      user: username,
      password
    }
  }, callback);
}

const getLastedReleaseTime = new Promise((resolve, reject) => {
  callGithubAPI({
    url: repoUrl + RELEASES_PATH,
    callback(error, response, body) {
      switch (response.statusCode) {
        case 200:
          const lastedRelease = JSON.parse(body).filter(release => {
            return ((release.target_commitish === 'master') || isHotfix) && !release.prerelease;
          })[0];
          const lastedReleaseTime = lastedRelease ? new Date(lastedRelease.created_at) : new Date(1970,1,1);
          return resolve(lastedReleaseTime);
        case 404:
          console.log("No releases before");
          return resolve(new Date(1970,1,1));
        default:
          console.log(error, body, response.statusCode);
          return reject(error);
      }
    }
  })
});

function getClosedPullRequestsAfter(time) {
  callGithubAPI({
    url: repoUrl + RECENT_CLOSED_PR_PATH,
    callback(error, response, body) {
      if (!error && (response.statusCode !== 200)) {
        return console.log(error, body);
      } else {
        const pullRequests = JSON.parse(body)
         .filter(pullRequest => new Date(pullRequest.merged_at) > time).filter(pullRequest => pullRequest.base.ref === baseBranch);
        if (pullRequests.length) {
          console.log(renderPullRequestsReport(pullRequests));
        } else {
          console.log('No new pull requests be merged.');
        }
      }
    }
  });
}

function renderPullRequestsReport(pullRequests) {
  let output = '';
  output += "New merged pull requests:";
  let index = 1;
  pullRequests.forEach(function(pullRequest) {
    output += `\n- [ ] ${index}. #${pullRequest.number} ${pullRequest.title} by @${pullRequest.user.login}`;
  });
  return output;
};

getLastedReleaseTime.then(lastedReleaseTime => getClosedPullRequestsAfter(lastedReleaseTime));
