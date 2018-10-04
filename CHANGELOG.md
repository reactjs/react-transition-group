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
