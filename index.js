(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('react'), require('chain-function'), require('warning'), require('dom-helpers/class/addClass'), require('dom-helpers/class/removeClass'), require('dom-helpers/util/requestAnimationFrame'), require('dom-helpers/transition/properties'), require('react-dom')) :
	typeof define === 'function' && define.amd ? define(['react', 'chain-function', 'warning', 'dom-helpers/class/addClass', 'dom-helpers/class/removeClass', 'dom-helpers/util/requestAnimationFrame', 'dom-helpers/transition/properties', 'react-dom'], factory) :
	(factory(global.React,global.chain,global.warning,global.addClass,global.removeClass,global.raf,global.domHelpers_transition_properties,global.reactDom));
}(this, (function (React,chain,warning,addClass,removeClass,raf,domHelpers_transition_properties,reactDom) { 'use strict';

var React__default = 'default' in React ? React['default'] : React;
chain = 'default' in chain ? chain['default'] : chain;
warning = 'default' in warning ? warning['default'] : warning;
addClass = 'default' in addClass ? addClass['default'] : addClass;
removeClass = 'default' in removeClass ? removeClass['default'] : removeClass;
raf = 'default' in raf ? raf['default'] : raf;

/**
 * Given `this.props.children`, return an object mapping key to child.
 *
 * @param {*} children `this.props.children`
 * @return {object} Mapping of key to child
 */
function getChildMapping(children) {
  if (!children) {
    return children;
  }
  var result = {};
  React.Children.map(children, function (child) {
    return child;
  }).forEach(function (child) {
    result[child.key] = child;
  });
  return result;
}

/**
 * When you're adding or removing children some may be added or removed in the
 * same render pass. We want to show *both* since we want to simultaneously
 * animate elements in and out. This function takes a previous set of keys
 * and a new set of keys and merges them with its best guess of the correct
 * ordering. In the future we may expose some of the utilities in
 * ReactMultiChild to make this easy, but for now React itself does not
 * directly have this concept of the union of prevChildren and nextChildren
 * so we implement it here.
 *
 * @param {object} prev prev children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @param {object} next next children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @return {object} a key set that contains all keys in `prev` and all keys
 * in `next` in a reasonable order.
 */
function mergeChildMappings(prev, next) {
  prev = prev || {};
  next = next || {};

  function getValueForKey(key) {
    if (next.hasOwnProperty(key)) {
      return next[key];
    }

    return prev[key];
  }

  // For each key of `next`, the list of keys to insert before that key in
  // the combined list
  var nextKeysPending = {};

  var pendingKeys = [];
  for (var prevKey in prev) {
    if (next.hasOwnProperty(prevKey)) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys;
        pendingKeys = [];
      }
    } else {
      pendingKeys.push(prevKey);
    }
  }

  var i = void 0;
  var childMapping = {};
  for (var nextKey in next) {
    if (nextKeysPending.hasOwnProperty(nextKey)) {
      for (i = 0; i < nextKeysPending[nextKey].length; i++) {
        var pendingNextKey = nextKeysPending[nextKey][i];
        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey);
      }
    }
    childMapping[nextKey] = getValueForKey(nextKey);
  }

  // Finally, add the keys which didn't appear before any key in `next`
  for (i = 0; i < pendingKeys.length; i++) {
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
  }

  return childMapping;
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes$1 = {
  component: React__default.PropTypes.any,
  childFactory: React__default.PropTypes.func,
  children: React__default.PropTypes.node
};

var defaultProps$1 = {
  component: 'span',
  childFactory: function childFactory(child) {
    return child;
  }
};

var TransitionGroup = function (_React$Component) {
  _inherits$1(TransitionGroup, _React$Component);

  function TransitionGroup(props, context) {
    _classCallCheck$1(this, TransitionGroup);

    var _this = _possibleConstructorReturn$1(this, (TransitionGroup.__proto__ || Object.getPrototypeOf(TransitionGroup)).call(this, props, context));

    _this.performAppear = function (key) {
      _this.currentlyTransitioningKeys[key] = true;

      var component = _this.childRefs[key];

      if (component.componentWillAppear) {
        component.componentWillAppear(_this._handleDoneAppearing.bind(_this, key));
      } else {
        _this._handleDoneAppearing(key);
      }
    };

    _this._handleDoneAppearing = function (key) {
      var component = _this.childRefs[key];
      if (component && component.componentDidAppear) {
        component.componentDidAppear();
      }

      delete _this.currentlyTransitioningKeys[key];

      var currentChildMapping = getChildMapping(_this.props.children);

      if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
        // This was removed before it had fully appeared. Remove it.
        _this.performLeave(key);
      }
    };

    _this.performEnter = function (key) {
      _this.currentlyTransitioningKeys[key] = true;

      var component = _this.childRefs[key];

      if (component.componentWillEnter) {
        component.componentWillEnter(_this._handleDoneEntering.bind(_this, key));
      } else {
        _this._handleDoneEntering(key);
      }
    };

    _this._handleDoneEntering = function (key) {
      var component = _this.childRefs[key];
      if (component && component.componentDidEnter) {
        component.componentDidEnter();
      }

      delete _this.currentlyTransitioningKeys[key];

      var currentChildMapping = getChildMapping(_this.props.children);

      if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
        // This was removed before it had fully entered. Remove it.
        _this.performLeave(key);
      }
    };

    _this.performLeave = function (key) {
      _this.currentlyTransitioningKeys[key] = true;

      var component = _this.childRefs[key];
      if (component.componentWillLeave) {
        component.componentWillLeave(_this._handleDoneLeaving.bind(_this, key));
      } else {
        // Note that this is somewhat dangerous b/c it calls setState()
        // again, effectively mutating the component before all the work
        // is done.
        _this._handleDoneLeaving(key);
      }
    };

    _this._handleDoneLeaving = function (key) {
      var component = _this.childRefs[key];

      if (component && component.componentDidLeave) {
        component.componentDidLeave();
      }

      delete _this.currentlyTransitioningKeys[key];

      var currentChildMapping = getChildMapping(_this.props.children);

      if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
        // This entered again before it fully left. Add it again.
        _this.performEnter(key);
      } else {
        _this.setState(function (state) {
          var newChildren = Object.assign({}, state.children);
          delete newChildren[key];
          return { children: newChildren };
        });
      }
    };

    _this.childRefs = Object.create(null);

    _this.state = {
      children: getChildMapping(props.children)
    };
    return _this;
  }

  _createClass$1(TransitionGroup, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.currentlyTransitioningKeys = {};
      this.keysToEnter = [];
      this.keysToLeave = [];
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var initialChildMapping = this.state.children;
      for (var key in initialChildMapping) {
        if (initialChildMapping[key]) {
          this.performAppear(key);
        }
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var nextChildMapping = getChildMapping(nextProps.children);
      var prevChildMapping = this.state.children;

      this.setState({
        children: mergeChildMappings(prevChildMapping, nextChildMapping)
      });

      for (var key in nextChildMapping) {
        var hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
        if (nextChildMapping[key] && !hasPrev && !this.currentlyTransitioningKeys[key]) {
          this.keysToEnter.push(key);
        }
      }

      for (var _key in prevChildMapping) {
        var hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(_key);
        if (prevChildMapping[_key] && !hasNext && !this.currentlyTransitioningKeys[_key]) {
          this.keysToLeave.push(_key);
        }
      }

      // If we want to someday check for reordering, we could do it here.
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var keysToEnter = this.keysToEnter;
      this.keysToEnter = [];
      keysToEnter.forEach(this.performEnter);

      var keysToLeave = this.keysToLeave;
      this.keysToLeave = [];
      keysToLeave.forEach(this.performLeave);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      // TODO: we could get rid of the need for the wrapper node
      // by cloning a single child
      var childrenToRender = [];

      var _loop = function _loop(key) {
        var child = _this2.state.children[key];
        if (child) {
          var isCallbackRef = typeof child.ref !== 'string';
          process.env.NODE_ENV !== 'production' ? warning(isCallbackRef, 'string refs are not supported on children of TransitionGroup and will be ignored. ' + 'Please use a callback ref instead: https://facebook.github.io/react/docs/refs-and-the-dom.html#the-ref-callback-attribute') : void 0;

          // You may need to apply reactive updates to a child as it is leaving.
          // The normal React way to do it won't work since the child will have
          // already been removed. In case you need this behavior you can provide
          // a childFactory function to wrap every child, even the ones that are
          // leaving.
          childrenToRender.push(React__default.cloneElement(_this2.props.childFactory(child), {
            key: key,
            ref: chain(isCallbackRef ? child.ref : null, function (r) {
              _this2.childRefs[key] = r;
            })
          }));
        }
      };

      for (var key in this.state.children) {
        _loop(key);
      }

      // Do not forward TransitionGroup props to primitive DOM nodes
      var props = Object.assign({}, this.props);
      delete props.transitionLeave;
      delete props.transitionName;
      delete props.transitionAppear;
      delete props.transitionEnter;
      delete props.childFactory;
      delete props.transitionLeaveTimeout;
      delete props.transitionEnterTimeout;
      delete props.transitionAppearTimeout;
      delete props.component;

      return React__default.createElement(this.props.component, props, childrenToRender);
    }
  }]);

  return TransitionGroup;
}(React__default.Component);

TransitionGroup.displayName = 'TransitionGroup';


TransitionGroup.propTypes = propTypes$1;
TransitionGroup.defaultProps = defaultProps$1;

function transitionTimeout(transitionType) {
  var timeoutPropName = 'transition' + transitionType + 'Timeout';
  var enabledPropName = 'transition' + transitionType;

  return function (props) {
    // If the transition is enabled
    if (props[enabledPropName]) {
      // If no timeout duration is provided
      if (props[timeoutPropName] == null) {
        return new Error(timeoutPropName + ' wasn\'t supplied to CSSTransitionGroup: ' + 'this can cause unreliable animations and won\'t be supported in ' + 'a future version of React. See ' + 'https://fb.me/react-animation-transition-group-timeout for more ' + 'information.');

        // If the duration isn't a number
      } else if (typeof props[timeoutPropName] !== 'number') {
        return new Error(timeoutPropName + ' must be a number (in milliseconds)');
      }
    }

    return null;
  };
}

var nameShape = React__default.PropTypes.oneOfType([React__default.PropTypes.string, React__default.PropTypes.shape({
  enter: React__default.PropTypes.string,
  leave: React__default.PropTypes.string,
  active: React__default.PropTypes.string
}), React__default.PropTypes.shape({
  enter: React__default.PropTypes.string,
  enterActive: React__default.PropTypes.string,
  leave: React__default.PropTypes.string,
  leaveActive: React__default.PropTypes.string,
  appear: React__default.PropTypes.string,
  appearActive: React__default.PropTypes.string
})]);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events = [];
if (domHelpers_transition_properties.transitionEnd) events.push(domHelpers_transition_properties.transitionEnd);
if (domHelpers_transition_properties.animationEnd) events.push(domHelpers_transition_properties.animationEnd);

function addEndListener(node, listener) {
  if (events.length) {
    events.forEach(function (e) {
      return node.addEventListener(e, listener, false);
    });
  } else {
    setTimeout(listener, 0);
  }

  return function () {
    if (!events.length) return;
    events.forEach(function (e) {
      return node.removeEventListener(e, listener, false);
    });
  };
}

var propTypes$2 = {
  children: React__default.PropTypes.node,
  name: nameShape.isRequired,

  // Once we require timeouts to be specified, we can remove the
  // boolean flags (appear etc.) and just accept a number
  // or a bool for the timeout flags (appearTimeout etc.)
  appear: React__default.PropTypes.bool,
  enter: React__default.PropTypes.bool,
  leave: React__default.PropTypes.bool,
  appearTimeout: React__default.PropTypes.number,
  enterTimeout: React__default.PropTypes.number,
  leaveTimeout: React__default.PropTypes.number
};

var CSSTransitionGroupChild = function (_React$Component) {
  _inherits$2(CSSTransitionGroupChild, _React$Component);

  function CSSTransitionGroupChild() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck$2(this, CSSTransitionGroupChild);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn$2(this, (_ref = CSSTransitionGroupChild.__proto__ || Object.getPrototypeOf(CSSTransitionGroupChild)).call.apply(_ref, [this].concat(args))), _this), _this.componentWillAppear = function (done) {
      if (_this.props.appear) {
        _this.transition('appear', done, _this.props.appearTimeout);
      } else {
        done();
      }
    }, _this.componentWillEnter = function (done) {
      if (_this.props.enter) {
        _this.transition('enter', done, _this.props.enterTimeout);
      } else {
        done();
      }
    }, _this.componentWillLeave = function (done) {
      if (_this.props.leave) {
        _this.transition('leave', done, _this.props.leaveTimeout);
      } else {
        done();
      }
    }, _temp), _possibleConstructorReturn$2(_this, _ret);
  }

  _createClass$2(CSSTransitionGroupChild, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.classNameAndNodeQueue = [];
      this.transitionTimeouts = [];
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.unmounted = true;

      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.transitionTimeouts.forEach(function (timeout) {
        clearTimeout(timeout);
      });

      this.classNameAndNodeQueue.length = 0;
    }
  }, {
    key: 'transition',
    value: function transition(animationType, finishCallback, timeout) {
      var node = reactDom.findDOMNode(this);

      if (!node) {
        if (finishCallback) {
          finishCallback();
        }
        return;
      }

      var className = this.props.name[animationType] || this.props.name + '-' + animationType;
      var activeClassName = this.props.name[animationType + 'Active'] || className + '-active';
      var timer = null;
      var removeListeners = void 0;

      addClass(node, className);

      // Need to do this to actually trigger a transition.
      this.queueClassAndNode(activeClassName, node);

      // Clean-up the animation after the specified delay
      var finish = function finish(e) {
        if (e && e.target !== node) {
          return;
        }

        clearTimeout(timer);
        if (removeListeners) removeListeners();

        removeClass(node, className);
        removeClass(node, activeClassName);

        if (removeListeners) removeListeners();

        // Usually this optional callback is used for informing an owner of
        // a leave animation and telling it to remove the child.
        if (finishCallback) {
          finishCallback();
        }
      };

      if (timeout) {
        timer = setTimeout(finish, timeout);
        this.transitionTimeouts.push(timer);
      } else if (domHelpers_transition_properties.transitionEnd) {
        removeListeners = addEndListener(node, finish);
      }
    }
  }, {
    key: 'queueClassAndNode',
    value: function queueClassAndNode(className, node) {
      var _this2 = this;

      this.classNameAndNodeQueue.push({
        className: className,
        node: node
      });

      if (!this.rafHandle) {
        this.rafHandle = raf(function () {
          return _this2.flushClassNameAndNodeQueue();
        });
      }
    }
  }, {
    key: 'flushClassNameAndNodeQueue',
    value: function flushClassNameAndNodeQueue() {
      if (!this.unmounted) {
        this.classNameAndNodeQueue.forEach(function (obj) {
          // This is for to force a repaint,
          // which is necessary in order to transition styles when adding a class name.
          /* eslint-disable no-unused-expressions */
          obj.node.scrollTop;
          /* eslint-enable no-unused-expressions */
          addClass(obj.node, obj.className);
        });
      }
      this.classNameAndNodeQueue.length = 0;
      this.rafHandle = null;
    }
  }, {
    key: 'render',
    value: function render() {
      var props = _extends({}, this.props);
      delete props.name;
      delete props.appear;
      delete props.enter;
      delete props.leave;
      delete props.appearTimeout;
      delete props.enterTimeout;
      delete props.leaveTimeout;
      delete props.children;
      return React__default.cloneElement(React__default.Children.only(this.props.children), props);
    }
  }]);

  return CSSTransitionGroupChild;
}(React__default.Component);

CSSTransitionGroupChild.displayName = 'CSSTransitionGroupChild';


CSSTransitionGroupChild.propTypes = propTypes$2;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
  transitionName: nameShape.isRequired,

  transitionAppear: React__default.PropTypes.bool,
  transitionEnter: React__default.PropTypes.bool,
  transitionLeave: React__default.PropTypes.bool,
  transitionAppearTimeout: transitionTimeout('Appear'),
  transitionEnterTimeout: transitionTimeout('Enter'),
  transitionLeaveTimeout: transitionTimeout('Leave')
};

var defaultProps = {
  transitionAppear: false,
  transitionEnter: true,
  transitionLeave: true
};

var CSSTransitionGroup = function (_React$Component) {
  _inherits(CSSTransitionGroup, _React$Component);

  function CSSTransitionGroup() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, CSSTransitionGroup);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = CSSTransitionGroup.__proto__ || Object.getPrototypeOf(CSSTransitionGroup)).call.apply(_ref, [this].concat(args))), _this), _this._wrapChild = function (child) {
      return React__default.createElement(CSSTransitionGroupChild, {
        name: _this.props.transitionName,
        appear: _this.props.transitionAppear,
        enter: _this.props.transitionEnter,
        leave: _this.props.transitionLeave,
        appearTimeout: _this.props.transitionAppearTimeout,
        enterTimeout: _this.props.transitionEnterTimeout,
        leaveTimeout: _this.props.transitionLeaveTimeout
      }, child);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // We need to provide this childFactory so that
  // ReactCSSTransitionGroupChild can receive updates to name, enter, and
  // leave while it is leaving.


  _createClass(CSSTransitionGroup, [{
    key: 'render',
    value: function render() {
      return React__default.createElement(TransitionGroup, Object.assign({}, this.props, { childFactory: this._wrapChild }));
    }
  }]);

  return CSSTransitionGroup;
}(React__default.Component);

CSSTransitionGroup.displayName = 'CSSTransitionGroup';


CSSTransitionGroup.propTypes = propTypes;
CSSTransitionGroup.defaultProps = defaultProps;

module.exports = {
  TransitionGroup: TransitionGroup,
  CSSTransitionGroup: CSSTransitionGroup
};

})));
