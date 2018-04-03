const types = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
]

module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'header-max-length': [0],
    'scope-case': [0],
    'subject-case': [0],
    'subject-full-stop': [0],
    'type-case': [0],
    'type-enum': [2, 'always', types],
  },
}
