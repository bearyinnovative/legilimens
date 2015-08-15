request = require('request')

GITHUB_API_ROOT = "https://api.github.com/repos/"
LATEST_RELEASE_PATH = "/releases/latest"
RECENT_CLOSED_PR_PATH = "/pulls?state=closed&sort=updated&direction=desc"

username = 'yourname'
password = 'password'
repoOwner = 'repo/owner'
repoName = 'reponame'

repoUrl = "#{GITHUB_API_ROOT}#{repoOwner}/#{repoName}"

getClosedPullRequestsAfter = (time) ->
  request
    url: repoUrl + RECENT_CLOSED_PR_PATH
    headers:
     'User-Agent': 'request'
    auth:
      user: username
      password: password
  ,  (error, response, body) ->
    if (!error and response.statusCode isnt 200)
      console.log error, body
    else
      pullRequests = JSON.parse(body).filter (pullRequest) ->
        new Date(pullRequest.merged_at) > time
      printPullRequestsReport(pullRequests)

getLastedReleaseTime = (callback) ->
  request
    url: repoUrl + LATEST_RELEASE_PATH
    headers:
     'User-Agent': 'request'
    auth:
      user: username
      password: password
  ,  (error, response, body) ->
    if (!error and response.statusCode isnt 200)
      console.log error, body
    else
      lastedReleaseTime = new Date(JSON.parse(body).created_at)
      console.log lastedReleaseTime
      callback(lastedReleaseTime)

printPullRequestsReport = (pullRequests) ->
  index = 1
  pullRequests.forEach (pullRequest) ->
    console.log "#{index}. #{pullRequest.title} by @#{pullRequest.user.login}"
    index++

getLastedReleaseTime(getClosedPullRequestsAfter)


