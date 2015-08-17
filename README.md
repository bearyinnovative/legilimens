# Legilimens

Generate pull requests report for GitHub release. It design for Pull Request Workflow

```
          +----------------------------------------------------+
          |+--------------------------------------+            |
          ||+---------+                           |            |
  Fork -> ||| Commits | -> Pull Requests -> Merge | -> Release |
          ||+---------+                           |            |
          |+--------------------------------------+            |
          +----------------------------------------------------+
```

Publish a Github release is a important part of our team(BearyInnovative)`s workflow. It happened before every deployment for prodution envivornment.

It benefits us quite a lot in these case:

  1. Rollback, Our CI tool can deploy code with a definite tag (release)
  2. Review, It help us to know the accurate time of features or bug fixes online

Legilimens help you generate release report with pull requests info


## Usage

1. Edit a config file in legilimens`s repo folder to setup GitHub account and repo

  `.config.json`

  ```
  {
    "username": // your github login name
    "password": // your github password
    "repo_owner": // repo owner e.g. github
    "repo_name": // repo name e.g. hubot
  }
  ```

2. Install packages
  `npm install`

3. Run Script
  `coffee legilimens.coffee`

In Harry Potter`s Magic World, Legilimens is the spell used for the practice of Legilimency (OP24). Legilimens is presumably used non-verbally whenever someone uses the arts of Legilimency to obtain information. However, there may be subtler ways to do this.

More info at [Harry Potter Wiki](http://harrypotter.wikia.com/wiki/Legilimency_Spell)

@loddit 2015
