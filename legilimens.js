const request = require('request');

const GITHUB_REPO_API_ROOT = "https://api.github.com/repos/";
const RELEASES_PATH = "/releases";
const RECENT_CLOSED_PR_PATH = "/pulls?state=closed&sort=updated&direction=desc";

function callGithubAPI({url, token, callback}) {
  request({
    url,
    headers: {
     'User-Agent': 'request',
     'Authorization': `token ${token}`
    },
  }, callback);
}

function getLastedReleaseTime(token, repoPath) {
  const repoUrl = `${GITHUB_REPO_API_ROOT}${repoPath}`;
  return new Promise((resolve, reject) => {
    callGithubAPI({
      url: repoUrl + RELEASES_PATH,
      token: token,
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
}

function getClosedPullRequestsAfter(token, repoPath, time, baseBranch="master", callback) {
  const repoUrl = `${GITHUB_REPO_API_ROOT}${repoPath}`;
  callGithubAPI({
    url: repoUrl + RECENT_CLOSED_PR_PATH,
    token: token,
    callback(error, response, body) {
      if (!error && (response.statusCode !== 200)) {
        return console.log(error, body);
      } else {
        const pullRequests = JSON.parse(body)
         .filter(pullRequest => new Date(pullRequest.merged_at) > time)
         .filter(pullRequest => pullRequest.base.ref === baseBranch);
        callback(renderPullRequestsReport(pullRequests));
      }
    }
  });
}

function renderPullRequestsReport(pullRequests) {
  let output = '';
  if (pullRequests.length) {
    output += "New merged pull requests:";
    let index = 1;
    pullRequests.forEach(function(pullRequest) {
      output += `\n- [ ] ${index}. #${pullRequest.number} ${pullRequest.title} by @${pullRequest.user.login}`;
    });
  } else {
    output += 'No new pull requests be merged.';
  }
  return output;
};


module.exports = (token, repoPath, baseBranch, callback) => {
  getLastedReleaseTime(token, repoPath).then((lastedReleaseTime) => {
    getClosedPullRequestsAfter(token, repoPath, lastedReleaseTime, baseBranch, callback);
  });
}
