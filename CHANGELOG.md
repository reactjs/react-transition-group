# [4.3.0](https://github.com/reactjs/react-transition-group/compare/v4.2.2...v4.3.0) (2019-09-05)


### Features

* upgrade dom-helpers ([#549](https://github.com/reactjs/react-transition-group/issues/549)) ([b017e18](https://github.com/reactjs/react-transition-group/commit/b017e18))

## [4.2.2](https://github.com/reactjs/react-transition-group/compare/v4.2.1...v4.2.2) (2019-08-02)


### Bug Fixes

* Fix imports to play nicely with rollup ([#530](https://github.com/reactjs/react-transition-group/issues/530)) ([3d9003e](https://github.com/reactjs/react-transition-group/commit/3d9003e))

## [4.2.1](https://github.com/reactjs/react-transition-group/compare/v4.2.0...v4.2.1) (2019-07-02)


### Bug Fixes

* updated SwitchTransition component to be default export and exported from index.js ([#516](https://github.com/reactjs/react-transition-group/issues/516)) ([cfd0070](https://github.com/reactjs/react-transition-group/commit/cfd0070))

# [4.2.0](https://github.com/reactjs/react-transition-group/compare/v4.1.1...v4.2.0) (2019-06-28)


### Features

* add SwitchTransition component ([#470](https://github.com/reactjs/react-transition-group/issues/470)) ([c5e379d](https://github.com/reactjs/react-transition-group/commit/c5e379d))

## [4.1.1](https://github.com/reactjs/react-transition-group/compare/v4.1.0...v4.1.1) (2019-06-10)


### Bug Fixes

* adds missing dependency [@babel](https://github.com/babel)/runtime ([#507](https://github.com/reactjs/react-transition-group/issues/507)) ([228bf5f](https://github.com/reactjs/react-transition-group/commit/228bf5f))

# [4.1.0](https://github.com/reactjs/react-transition-group/compare/v4.0.1...v4.1.0) (2019-05-30)


### Features

* add global transition disable switch ([#506](https://github.com/reactjs/react-transition-group/issues/506)) ([4c5ba98](https://github.com/reactjs/react-transition-group/commit/4c5ba98))

## [4.0.1](https://github.com/reactjs/react-transition-group/compare/v4.0.0...v4.0.1) (2019-05-09)


### Bug Fixes

* issue with dynamically applied classes not being properly removed for reentering items ([#499](https://github.com/reactjs/react-transition-group/issues/499)) ([129cb11](https://github.com/reactjs/react-transition-group/commit/129cb11))

# [4.0.0](https://github.com/reactjs/react-transition-group/compare/v3.0.0...v4.0.0) (2019-04-16)


### Features

* support esm via package.json routes ([#488](https://github.com/reactjs/react-transition-group/issues/488)) ([6337bf5](https://github.com/reactjs/react-transition-group/commit/6337bf5)), closes [#77](https://github.com/reactjs/react-transition-group/issues/77)


### BREAKING CHANGES

* in environments where esm is supported importing from commonjs requires explicitly adding the `.default` after `require()` when resolving to the esm build

# [3.0.0](https://github.com/reactjs/react-transition-group/compare/v2.9.0...v3.0.0) (2019-04-15)


### Features

* use stable context API ([#471](https://github.com/reactjs/react-transition-group/issues/471)) ([aee4901](https://github.com/reactjs/react-transition-group/commit/aee4901)), closes [#429](https://github.com/reactjs/react-transition-group/issues/429)


### BREAKING CHANGES

* use new style react context

```diff
// package.json
-"react": "^15.0.0",
+"react": "^16.6.0",
-"react-dom": "^15.0.0", 
+"react-dom": "^16.6.0", 
```

# [2.9.0](https://github.com/reactjs/react-transition-group/compare/v2.8.0...v2.9.0) (2019-04-06)


### Features

* **CSSTransition:** add "done" class for appear ([fe3c156](https://github.com/reactjs/react-transition-group/commit/fe3c156)), closes [#383](https://github.com/reactjs/react-transition-group/issues/383) [#327](https://github.com/reactjs/react-transition-group/issues/327) [#327](https://github.com/reactjs/react-transition-group/issues/327)


### Reverts

* bump semantic release dependencies ([1bdcaec](https://github.com/reactjs/react-transition-group/commit/1bdcaec))

# [2.8.0](https://github.com/reactjs/react-transition-group/compare/v2.7.1...v2.8.0) (2019-04-02)


### Features

* add support for empty classNames ([#481](https://github.com/reactjs/react-transition-group/issues/481)) ([d755dc6](https://github.com/reactjs/react-transition-group/commit/d755dc6))

## [2.7.1](https://github.com/reactjs/react-transition-group/compare/v2.7.0...v2.7.1) (2019-03-25)


### Bug Fixes

* revert tree-shaking support because it was a breaking change ([271364c](https://github.com/reactjs/react-transition-group/commit/271364c))

# [2.7.0](https://github.com/reactjs/react-transition-group/compare/v2.6.1...v2.7.0) (2019-03-22)


### Features

* support ESM (tree-shaking) ([#455](https://github.com/reactjs/react-transition-group/issues/455)) ([ef3e357](https://github.com/reactjs/react-transition-group/commit/ef3e357))

## [2.6.1](https://github.com/reactjs/react-transition-group/compare/v2.6.0...v2.6.1) (2019-03-14)


### Bug Fixes

* **Transition:** make `exit` key optional when passing an object to the `timeout` prop ([#464](https://github.com/reactjs/react-transition-group/pull/464)) ([3a4cf9c](https://github.com/reactjs/react-transition-group/commit/3a4cf9c91ab5f25caaa9501b129bce66ec9bb56b))
* **package.json:** mark react-transition-group as side-effect free for webpack tree shaking ([#472](https://github.com/reactjs/react-transition-group/issues/472)) ([b81dc89](https://github.com/reactjs/react-transition-group/commit/b81dc89))

# [2.6.0](https://github.com/reactjs/react-transition-group/compare/v2.5.3...v2.6.0) (2019-02-26)


### Features

* add appear timeout ([#462](https://github.com/reactjs/react-transition-group/issues/462)) ([52cdc34](https://github.com/reactjs/react-transition-group/commit/52cdc34))

## [2.5.3](https://github.com/reactjs/react-transition-group/compare/v2.5.2...v2.5.3) (2019-01-14)


### Bug Fixes

* strip custom prop-types in production ([#448](https://github.com/reactjs/react-transition-group/issues/448)) ([46fa20f](https://github.com/reactjs/react-transition-group/commit/46fa20f))

## [2.5.2](https://github.com/reactjs/react-transition-group/compare/v2.5.1...v2.5.2) (2018-12-20)


### Bug Fixes

* pass appear to CSSTransition callbacks ([#441](https://github.com/reactjs/react-transition-group/issues/441)) ([df7adb4](https://github.com/reactjs/react-transition-group/commit/df7adb4)), closes [#143](https://github.com/reactjs/react-transition-group/issues/143)

## [2.5.1](https://github.com/reactjs/react-transition-group/compare/v2.5.0...v2.5.1) (2018-12-10)


### Bug Fixes

* prevent calling setState in TransitionGroup if it has been unmounted ([#435](https://github.com/reactjs/react-transition-group/issues/435)) ([6d46b69](https://github.com/reactjs/react-transition-group/commit/6d46b69))

# [2.5.0](https://github.com/reactjs/react-transition-group/compare/v2.4.0...v2.5.0) (2018-09-26)


### Features

* update build and package dependencies ([#413](https://github.com/reactjs/react-transition-group/issues/413)) ([af3d45a](https://github.com/reactjs/react-transition-group/commit/af3d45a))

# [2.4.0](https://github.com/reactjs/react-transition-group/compare/v2.3.1...v2.4.0) (2018-06-27)


### Features

* remove deprecated lifecycle hooks and polyfill for older react versions ([c1ab1cf](https://github.com/reactjs/react-transition-group/commit/c1ab1cf))


### Performance Improvements

* don't reflow when there's no class to add ([d7b898d](https://github.com/reactjs/react-transition-group/commit/d7b898d))

<a name="2.3.1"></a>
## [2.3.1](https://github.com/reactjs/react-transition-group/compare/v2.3.0...v2.3.1) (2018-04-14)


### Bug Fixes

* **deps:** Move loose-envify and semantic-release to devDependencies ([#319](https://github.com/reactjs/react-transition-group/issues/319)) ([b4ec774](https://github.com/reactjs/react-transition-group/commit/b4ec774))

## [v2.3.0]

> 2018-03-28

* Added `*-done` classes to CSS Transition ([#269])
* Reorganize docs with more interesting examples! ([#304])
* A bunch of bug fixes

[#269]: https://github.com/reactjs/react-transition-group/pull/269
[#304]: https://github.com/reactjs/react-transition-group/pull/304
[v2.3.0]: https://github.com/reactjs/react-transition-group/compare/v2.2.1...2.3.0

## [v2.2.1]

> 2017-09-29

* **Patch:** Allow React v16 ([#198])

[#198]: https://github.com/reactjs/react-transition-group/pull/198
[v2.2.1]: https://github.com/reactjs/react-transition-group/compare/v2.2.0...2.2.1

## [v2.2.0]

> 2017-07-21

* **Feature:** Support multiple classes in `classNames` ([#124])
* **Docs:** fix broken link ([#127])
* **Bugfix:** Fix Transition props pass-through ([#123])

[#124]: https://github.com/reactjs/react-transition-group/pull/124
[#123]: https://github.com/reactjs/react-transition-group/pull/123
[#127]: https://github.com/reactjs/react-transition-group/pull/127
[v2.2.0]: https://github.com/reactjs/react-transition-group/compare/v2.1.0...2.2.0

## [v2.1.0]

> 2017-07-06

* **Feature:** Add back `childFactory` on `<TransitionGroup>` ([#113])
* **Bugfix:** Ensure child specified `onExited` fires in a `<TransitionGroup>` ([#113])

[#113]: https://github.com/reactjs/react-transition-group/pull/113
[v2.1.0]: https://github.com/reactjs/react-transition-group/compare/v2.0.1...2.1.0

## v2.0.2

> 2017-07-06

* **Fix documentation npm:** No code changes

## v2.0.1

> 2017-07-06

* **Fix documentation on npm:** No code changes

## [v2.0.0]

> 2017-07-06

* **Feature:** New API! ([#24]), migration guide at [https://github.com/reactjs/react-transition-group/blob/master/Migration.md](https://github.com/reactjs/react-transition-group/blob/master/Migration.md)

[#24]: https://github.com/reactjs/react-transition-group/pull/24
[v2.0.0]: https://github.com/reactjs/react-transition-group/compare/v1.2.0...v2.0.0

## [v1.2.0]

> 2017-06-12

* **Feature:** Dist build now includes both production and development builds ([#64])
* **Feature:** PropTypes are now wrapped allowing for lighter weight production builds ([#69])

[#64]: https://github.com/reactjs/react-transition-group/issues/64
[#69]: https://github.com/reactjs/react-transition-group/issues/69
[v1.1.x]: https://github.com/reactjs/react-transition-group/compare/v1.1.3...master

## [v1.1.3]

> 2017-05-02

* bonus release, no additions

[v1.1.3]: https://github.com/reactjs/react-transition-group/compare/v1.1.2...v1.1.3

## [v1.1.2]

> 2017-05-02

* **Bugfix:** Fix refs on children ([#39])

[v1.1.2]: https://github.com/reactjs/react-transition-group/compare/v1.1.1...v1.1.2
[#39]: https://github.com/reactjs/react-transition-group/pull/39

## [v1.1.1]

> 2017-03-16

* **Chore:** Add a prebuilt version of the library for jsbin and the like.

[v1.1.1]: https://github.com/reactjs/react-transition-group/compare/v1.1.0...v1.1.1

## [v1.1.0]

> 2017-03-16

* **Feature:** Support refs on children ([#9])
* **Feature:** TransitionChild to passes props through ([#4])
* **Bugfix:** Fix TransitionGroup error on quick toggle of components ([#15])
* **Bugfix:** Fix to work enter animation with CSSTransitionGroup ([#13])

[v1.1.0]: https://github.com/reactjs/react-transition-group/compare/v1.0.0...v1.1.0
[#15]: https://github.com/reactjs/react-transition-group/pull/15
[#13]: https://github.com/reactjs/react-transition-group/pull/13
[#9]: https://github.com/reactjs/react-transition-group/pull/9
[#4]: https://github.com/reactjs/react-transition-group/pull/4
