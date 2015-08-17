request = require('request')
fs = require('fs')

config = JSON.parse(fs.readFileSync('.config.json','utf8'))

GITHUB_REPO_API_ROOT = "https://api.github.com/repos/"
LATEST_RELEASE_PATH = "/releases/latest"
RECENT_CLOSED_PR_PATH = "/pulls?state=closed&sort=updated&direction=desc"

username = config.username
password = config.password
repoPath = config.repo_path

repoUrl = "#{GITHUB_REPO_API_ROOT}#{repoPath}"

callGithubAPI = ({url, callback}) ->
  request
    url: url
    headers:
     'User-Agent': 'request'
    auth:
      user: username
      password: password
  , callback

getLastedReleaseTime = new Promise (resolve, reject) ->
  callGithubAPI
    url: repoUrl + LATEST_RELEASE_PATH
    callback: (error, response, body) ->
      switch response.statusCode
        when 200
          lastedReleaseTime = new Date(JSON.parse(body).created_at)
          console.log "Last release time is #{lastedReleaseTime.toLocaleDateString()} #{lastedReleaseTime.toLocaleTimeString()}\n"
          resolve(lastedReleaseTime)
        when 404
          console.log "No releases before"
          resolve(new Date(1970,1,1))
        else
          console.log error, body, response.statusCode
          reject error

getClosedPullRequestsAfter = (time) ->
  callGithubAPI
    url: repoUrl + RECENT_CLOSED_PR_PATH
    callback: (error, response, body) ->
      if (!error and response.statusCode isnt 200)
        console.log error, body
      else
        pullRequests = JSON.parse(body).filter (pullRequest) ->
          new Date(pullRequest.merged_at) > time
        if pullRequests.length
          printPullRequestsReport(pullRequests)
        else
          console.log 'No new pull requests be merged.'

printPullRequestsReport = (pullRequests) ->
  console.log "New merged pull requests:"
  index = 1
  pullRequests.forEach (pullRequest) ->
    console.log "#{index}. ##{pullRequest.number} #{pullRequest.title} by @#{pullRequest.user.login}"
    index++

getLastedReleaseTime.then (lastedReleaseTime) ->
  getClosedPullRequestsAfter(lastedReleaseTime)
