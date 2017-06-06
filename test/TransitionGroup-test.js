import tsp from 'teaspoon';

let React;
let PropTypes;
let ReactDOM;
let TransitionGroup;

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('TransitionGroup', () => {
  let container;

  beforeEach(() => {
    React = require('react');
    PropTypes = require('prop-types');
    ReactDOM = require('react-dom');
    TransitionGroup = require('../src/TransitionGroup');

    container = document.createElement('div');
  });

  it('should warn when string refs are used', () => {
    class Child extends React.Component {
      render() {
        return <span />;
      }
    }

    spyOn(console, 'error');

    tsp(
      <TransitionGroup>
        <Child ref="string" />
      </TransitionGroup>,
    )
    .render();

    expect(console.error).toHaveBeenCalled();
    expect(console.error.calls.mostRecent().args[0]).toMatch(
      /string refs are not supported on children of TransitionGroup and will be ignored/,
    );
  });

  it('should allow null components', () => {
    function FirstChild(props) {
      const childrenArray = React.Children.toArray(props.children);
      return childrenArray[0] || null;
    }

    tsp(
      <TransitionGroup component={FirstChild}>
        <span />
      </TransitionGroup>,
    )
    .render();
  });

  it('should allow callback refs', () => {
    const ref = jest.fn();

    class Child extends React.Component {
      render() {
        return <span />;
      }
    }

    tsp(
      <TransitionGroup>
        <Child ref={ref} />
      </TransitionGroup>,
    )
    .render();

    expect(ref).toHaveBeenCalled();
  });

  it('properly calls ref if childFactory doesn\'t create a wrapper', () => {
    let transition;

    const transitionRef = (r) => { transition = r; };
    const childRef = jest.fn();

    class Child extends React.Component {
      render() {
        return (<span />);
      }
    }

    const rendered = tsp(
      <TransitionGroup ref={transitionRef}>
        <Child key="child" ref={childRef} />
      </TransitionGroup>,
    )
    .render();

    expect(transition.childRefs['.$child']).toEqual(jasmine.any(Child));

    rendered.unmount();

    for (let i in childRef.mock.calls) {
      let call = childRef.mock.calls[i];
      let valid = (call[0] === null || call[0] instanceof Child) && call.length === 1;

      expect(valid).toBeTruthy();
    }
  });

  it('properly calls ref if childFactory does create a wrapper', () => {
    let transition;

    const transitionRef = (r) => { transition = r; };
    const childRef = jest.fn();

    class Wrapper extends React.Component {
      static propTypes = {
        children: PropTypes.element,
      }

      render() {
        return this.props.children;
      }
    }

    class Child extends React.Component {
      render() {
        return (<span />);
      }
    }

    const childFactory = x => React.createElement(Wrapper, null, x);

    const rendered = tsp(
      <TransitionGroup ref={transitionRef} childFactory={childFactory}>
        <Child key="child" ref={childRef} />
      </TransitionGroup>,
    )
    .render();

    expect(transition.childRefs['.$child']).toEqual(jasmine.any(Wrapper));

    rendered.unmount();

    for (let i in childRef.mock.calls) {
      let call = childRef.mock.calls[i];
      let valid = (call[0] === null || call[0] instanceof Child) && call.length === 1;

      expect(valid).toBeTruthy();
    }
  });

  it('should handle willEnter correctly', () => {
    let log = [];

    class Child extends React.Component {
      componentDidMount() {
        log.push('didMount');
      }
      componentWillUnmount() {
        log.push('willUnmount');
      }

      componentWillAppear = (cb) => {
        log.push('willAppear');
        cb();
      };

      componentDidAppear = () => {
        log.push('didAppear');
      };

      componentWillEnter = (cb) => {
        log.push('willEnter');
        cb();
      };

      componentDidEnter = () => {
        log.push('didEnter');
      };

      componentWillLeave = (cb) => {
        log.push('willLeave');
        cb();
      };

      componentDidLeave = () => {
        log.push('didLeave');
      };

      render() {
        return <span />;
      }
    }

    class Component extends React.Component {
      state = { count: 1 };

      render() {
        let children = [];
        for (let i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} />);
        }
        return <TransitionGroup>{children}</TransitionGroup>;
      }
    }

    let instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount', 'willAppear', 'didAppear']);

    log = [];
    instance.setState({ count: 2 }, () => {
      expect(log).toEqual(['didMount', 'willEnter', 'didEnter']);

      log = [];
      instance.setState({ count: 1 });
    });

    expect(log).toEqual(['willLeave', 'didLeave', 'willUnmount']);
  });

  it('should handle enter/leave/enter/leave correctly', () => {
    let log = [];
    let willEnterCb;

    class Child extends React.Component {
      componentDidMount() {
        log.push('didMount');
      }

      componentWillUnmount() {
        log.push('willUnmount');
      }

      componentWillEnter = (cb) => {
        log.push('willEnter');
        willEnterCb = cb;
      };

      componentDidEnter = () => {
        log.push('didEnter');
      };

      componentWillLeave = (cb) => {
        log.push('willLeave');
        cb();
      };

      componentDidLeave = () => {
        log.push('didLeave');
      };

      render() {
        return <span />;
      }
    }

    class Component extends React.Component {
      state = { count: 1 };

      render() {
        let children = [];
        for (let i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} />);
        }
        return <TransitionGroup>{children}</TransitionGroup>;
      }
    }

    let instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount']);
    instance.setState({ count: 2 });
    expect(log).toEqual(['didMount', 'didMount', 'willEnter']);

    for (let k = 0; k < 5; k++) {
      instance.setState({ count: 2 });
      expect(log).toEqual(['didMount', 'didMount', 'willEnter']);
      instance.setState({ count: 1 });
    }
    // other animations are blocked until willEnterCb is called
    willEnterCb();
    expect(log).toEqual([
      'didMount', 'didMount', 'willEnter',
      'didEnter', 'willLeave', 'didLeave', 'willUnmount',
    ]);
  });

  it('should handle enter/leave/enter correctly', () => {
    let log = [];
    let willEnterCb;

    class Child extends React.Component {
      componentDidMount() {
        log.push('didMount');
      }

      componentWillUnmount() {
        log.push('willUnmount');
      }

      componentWillEnter = (cb) => {
        log.push('willEnter');
        willEnterCb = cb;
      };

      componentDidEnter = () => {
        log.push('didEnter');
      };

      componentWillLeave = (cb) => {
        log.push('willLeave');
        cb();
      };

      componentDidLeave = () => {
        log.push('didLeave');
      };

      render() {
        return <span />;
      }
    }

    class Component extends React.Component {
      state = { count: 1 };

      render() {
        let children = [];
        for (let i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} />);
        }
        return <TransitionGroup>{children}</TransitionGroup>;
      }
    }

    let instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount']);
    instance.setState({ count: 2 });
    expect(log).toEqual(['didMount', 'didMount', 'willEnter']);

    for (let k = 0; k < 5; k++) {
      instance.setState({ count: 1 });
      expect(log).toEqual(['didMount', 'didMount', 'willEnter']);
      instance.setState({ count: 2 });
    }
    willEnterCb();
    expect(log).toEqual([
      'didMount', 'didMount', 'willEnter', 'didEnter',
    ]);
  });

  it('should handle entering/leaving several elements at once', () => {
    let log = [];

    class Child extends React.Component {
      componentDidMount() {
        log.push('didMount' + this.props.id);
      }

      componentWillUnmount() {
        log.push('willUnmount' + this.props.id);
      }

      componentWillEnter = (cb) => {
        log.push('willEnter' + this.props.id);
        cb();
      };

      componentDidEnter = () => {
        log.push('didEnter' + this.props.id);
      };

      componentWillLeave = (cb) => {
        log.push('willLeave' + this.props.id);
        cb();
      };

      componentDidLeave = () => {
        log.push('didLeave' + this.props.id);
      };

      render() {
        return <span />;
      }
    }

    class Component extends React.Component {
      state = { count: 1 };

      render() {
        let children = [];
        for (let i = 0; i < this.state.count; i++) {
          children.push(<Child key={i} id={i} />);
        }
        return <TransitionGroup>{children}</TransitionGroup>;
      }
    }

    let instance = ReactDOM.render(<Component />, container);
    expect(log).toEqual(['didMount0']);
    log = [];

    instance.setState({ count: 3 });
    expect(log).toEqual([
      'didMount1', 'didMount2', 'willEnter1', 'didEnter1',
      'willEnter2', 'didEnter2',
    ]);
    log = [];

    instance.setState({ count: 0 });
    expect(log).toEqual([
      'willLeave0', 'didLeave0', 'willLeave1', 'didLeave1',
      'willLeave2', 'didLeave2', 'willUnmount0', 'willUnmount1', 'willUnmount2',
    ]);
  });

  it('should warn for duplicated keys with component stack info', () => {
    spyOn(console, 'error');

    class Component extends React.Component {
      render() {
        let children = [<div key="1" />, <div key="1" />];
        return <TransitionGroup>{children}</TransitionGroup>;
      }
    }

    ReactDOM.render(<Component />, container);

    // expect(console.error.calls.count()).toBe(2);
    // expect(console.error.calls.argsFor(0)[0]).toBe(
    //   'Warning: flattenChildren(...): ' +
    //   'Encountered two children with the same key, `1`. ' +
    //   'Child keys must be unique; when two children share a key, ' +
    //   'only the first child will be used.'
    // );
    // expect(normalizeCodeLocInfo(console.error.calls.argsFor(1)[0])).toBe(
    //   'Warning: flattenChildren(...): ' +
    //   'Encountered two children with the same key, `1`. ' +
    //   'Child keys must be unique; when two children share a key, ' +
    //   'only the first child will be used.\n' +
    //   '    in TransitionGroup (at **)\n' +
    //   '    in Component (at **)'
    // );
  });

  it('should not throw when enter callback is called and is now leaving', () => {
    class Child extends React.Component {
      componentWillReceiveProps() {
        if (this.callback) {
          this.callback();
        }
      }

      componentWillEnter(callback) {
        this.callback = callback;
      }

      render() {
        return (<span />);
      }
    }

    class Component extends React.Component {
      render() {
        return (
          <TransitionGroup>
            {this.props.children}
          </TransitionGroup>
        );
      }
    }

    // render the base component
    ReactDOM.render(<Component />, container);
    // now make the child enter
    ReactDOM.render(
      <Component><Child key="child" /></Component>,
      container,
    );
    // rendering the child leaving will call 'componentWillProps' which will trigger the
    // callback. This would throw an error previously.
    expect(ReactDOM.render.bind(this, <Component />, container)).not.toThrow();
  })

  it('should not throw when leave callback is called and is now entering', () => {
    class Child extends React.Component {
      componentWillReceiveProps() {
        if (this.callback) {
          this.callback();
        }
      }

      componentWillLeave(callback) {
        this.callback = callback;
      }

      render() {
        return (<span />);
      }
    }

    class Component extends React.Component {
      render() {
        return (
          <TransitionGroup>
            {this.props.children}
          </TransitionGroup>
        );
      }
    }

    // render the base component
    ReactDOM.render(<Component />, container);
    // now make the child enter
    ReactDOM.render(
      <Component><Child key="child" /></Component>,
      container,
    );
    // make the child leave
    ReactDOM.render(<Component />, container);
    // rendering the child entering again will call 'componentWillProps' which will trigger the
    // callback. This would throw an error previously.
    expect(ReactDOM.render.bind(this, <Component><Child key="child" /></Component>, container)).not.toThrow();
  })
});
