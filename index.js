const fs = require('fs');
const {getLastedReleaseTime, getClosedPullRequestsAfter} = require('./legilimens.js');

const config = JSON.parse(fs.readFileSync('.config.json','utf8'));

const token = config.token;
const repoPath = config.repo_path;
const baseBranch = process.argv[2] || config.repo_branch || 'master';
const isHotfix = !!process.argv[2];


getLastedReleaseTime(token, repoPath).then((lastedReleaseTime) => {
  getClosedPullRequestsAfter(token, repoPath, lastedReleaseTime, baseBranch)
});


