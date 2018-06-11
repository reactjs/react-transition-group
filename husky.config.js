module.exports = {
  hooks: {
    'commit-msg': 'commitlint -e $GIT_PARAMS',
  },
}
