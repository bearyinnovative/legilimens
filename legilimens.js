const request = require('request');

const GITHUB_REPO_API_ROOT = "https://api.github.com/repos/";
const RELEASES_PATH = "/releases";
const RECENT_CLOSED_PR_PATH = "/pulls?state=closed&sort=updated&direction=desc";

function callGithubAPI({url, token=null, callback}) {
  const headers = {
   'User-Agent': 'legilimens',
  };
  if (token) {
   headers['Authorization'] = `token ${token}`;
  }
  request({
    url,
    headers,
  }, callback);
}

function getLastedRelease(token, repoPath, baseBranch="master") {
  const repoUrl = `${GITHUB_REPO_API_ROOT}${repoPath}`;
  return new Promise((resolve, reject) => {
    callGithubAPI({
      url: repoUrl + RELEASES_PATH,
      token: token,
      callback(error, response, body) {
        switch (response.statusCode) {
          case 200:
            const lastedRelease = JSON.parse(body).filter(release => {
              return release.target_commitish === baseBranch && !release.prerelease;
            })[0];
            return resolve(lastedRelease);
          case 404:
            console.log("No releases before");
            return resolve(null);
          default:
            console.log(error, body, response.statusCode);
            return reject(error);
        }
      }
    })
  });
}

function getClosedPullRequestsAfter(token, repoPath, lastedRelease, baseBranch="master", callback) {
  const repoUrl = `${GITHUB_REPO_API_ROOT}${repoPath}`;
  const lastedReleaseTime = lastedRelease ? new Date(lastedRelease.created_at) : new Date(1970,1,1);
  callGithubAPI({
    url: repoUrl + RECENT_CLOSED_PR_PATH,
    token: token,
    callback(error, response, body) {
      if (!error && (response.statusCode !== 200)) {
        return console.log(error, body);
      } else {
        const pullRequests = JSON.parse(body)
         .filter(pullRequest => new Date(pullRequest.merged_at) > lastedReleaseTime)
         .filter(pullRequest => pullRequest.base.ref === baseBranch);
        callback(renderPullRequestsReport(pullRequests, lastedRelease));
      }
    }
  });
}

function renderPullRequestsReport(pullRequests, lastedRelease) {
  let output = '';
  if (pullRequests.length) {
    output += `New merged pull requests after last release: [${lastedRelease.tag_name}](${lastedRelease.html_url})`;
    let index = 1;
    pullRequests.forEach(function(pullRequest) {
      output += `\n- [ ] ${index}. #${pullRequest.number} ${pullRequest.title} by @${pullRequest.user.login}`;
      index++;
    });
  } else {
    output += `No new pull requests be merged after last release: [${lastedRelease.tag_name}](${lastedRelease.html_url})`;
  }
  return output;
};


module.exports = (token, repoPath, baseBranch, callback) => {
  getLastedRelease(token, repoPath, baseBranch).then((lastedRelease) => {
    getClosedPullRequestsAfter(token, repoPath, lastedRelease, baseBranch, callback);
  });
}
