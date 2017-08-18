const fs = require('fs');
const legilimens = require('./legilimens.js');
const inquirer = require('inquirer');

if (fs.existsSync(".config.json")) {
  const config = JSON.parse(fs.readFileSync('.config.json','utf8'));
  const token = config.token;
  const repoPath = config.repo_path;
  const baseBranch = process.argv[2] || config.repo_branch || 'master';
  legilimens(token, repoPath, baseBranch, (output) => {
    console.log(output);
  })
} else {
  const questions = [{
    type: "input",
    name: "repo",
    message: "what is your repo path? (as hubotio/hubot in https://github.com/hubotio/hubot)\n"
  }, {
    type: "input",
    name: "branch",
    message: "what is your repo release branch?\n",
    default: "master"
  }, {
    type: "input",
    name: "branch",
    message: "give me a access token for API, you can get one via https://github.com/settings/tokens\n(optional, not need for public repo)",
    default: null
  }]
  inquirer.prompt(questions).then(function (answers) {
    legilimens(answers.token, answers.repo, answers.branch, (output) => {
      console.log(output);
    })
  });
}


