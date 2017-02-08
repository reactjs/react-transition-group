import hasClass from 'dom-helpers/class/hasClass';

let React;
let ReactDOM;
let CSSTransitionGroup;

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('CSSTransitionGroup', () => {
  let container;

  beforeEach(() => {
    jest.resetModuleRegistry();

    React = require('react');
    ReactDOM = require('react-dom');
    CSSTransitionGroup = require('../src/CSSTransitionGroup');

    container = document.createElement('div');
    spyOn(console, 'error');
  });

  it('should warn if timeouts aren\'t specified', () => {
    ReactDOM.render(
      <CSSTransitionGroup
        transitionName="yolo"
        transitionEnter={false}
        transitionLeave={true}
      >
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );

    // Warning about the missing transitionLeaveTimeout prop
    expect(console.error.calls.count()).toBe(1);
  });

  it('should not warn if timeouts is zero', () => {
    ReactDOM.render(
      <CSSTransitionGroup
        transitionName="yolo"
        transitionEnter={false}
        transitionLeave={true}
        transitionLeaveTimeout={0}
      >
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );

    expect(console.error.calls.count()).toBe(0);
  });

  it('should clean-up silently after the timeout elapses', () => {
    let a = ReactDOM.render(
      <CSSTransitionGroup
        transitionName="yolo"
        transitionEnter={false}
        transitionLeaveTimeout={200}
      >
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);

    setTimeout.mock.calls.length = 0;

    ReactDOM.render(
      <CSSTransitionGroup
        transitionName="yolo"
        transitionEnter={false}
        transitionLeaveTimeout={200}
      >
        <span key="two" id="two" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('two');
    expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('one');

    // For some reason jst is adding extra setTimeout()s and grunt test isn't,
    // so we need to do this disgusting hack.
    for (let i = 0; i < setTimeout.mock.calls.length; i++) {
      if (setTimeout.mock.calls[i][1] === 200) {
        setTimeout.mock.calls[i][0]();
        break;
      }
    }

    // No warnings
    expect(console.error.calls.count()).toBe(0);

    // The leaving child has been removed
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('two');
  });

  it('should keep both sets of DOM nodes around', () => {
    let a = ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo">
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo">
        <span key="two" id="two" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('two');
    expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('one');
  });

  it('should switch transitionLeave from false to true', () => {
    let a = ReactDOM.render(
      <CSSTransitionGroup
        transitionName="yolo"
        transitionEnter={false}
        transitionLeave={false}
      >
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <CSSTransitionGroup
        transitionName="yolo"
        transitionEnter={false}
        transitionLeave={false}
      >
        <span key="two" id="two" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <CSSTransitionGroup
        transitionName="yolo"
        transitionEnter={false}
        transitionLeave={true}
      >
        <span key="three" id="three" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('three');
    expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('two');
  });

  it('should work with no children', () => {
    ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo" />,
      container,
    );
  });

  it('should work with a null child', () => {
    ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo">
        {[null]}
      </CSSTransitionGroup>,
      container,
    );
  });

  it('should transition from one to null', () => {
    let a = ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo">
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo">
        {null}
      </CSSTransitionGroup>,
      container,
    );
    // (Here, we expect the original child to stick around but test that no
    // exception is thrown)
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('one');
  });

  it('should transition from false to one', () => {
    let a = ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo">
        {false}
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(0);
    ReactDOM.render(
      <CSSTransitionGroup transitionName="yolo">
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('one');
  });

  it('should use transition-type specific names when they\'re provided', () => {
    let customTransitionNames = {
      enter: 'custom-entering',
      leave: 'custom-leaving',
    };

    let a = ReactDOM.render(
      <CSSTransitionGroup
        transitionName={customTransitionNames}
        transitionEnterTimeout={1}
        transitionLeaveTimeout={1}
      >
        <span key="one" id="one" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);

    // Add an element
    ReactDOM.render(
      <CSSTransitionGroup
        transitionName={customTransitionNames}
        transitionEnterTimeout={1}
        transitionLeaveTimeout={1}
      >
        <span key="one" id="one" />
        <span key="two" id="two" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);

    let enteringNode = ReactDOM.findDOMNode(a).childNodes[1];
    expect(hasClass(enteringNode, 'custom-entering')).toBe(true);

    // Remove an element
    ReactDOM.render(
      <CSSTransitionGroup
        transitionName={customTransitionNames}
        transitionEnterTimeout={1}
        transitionLeaveTimeout={1}
      >
        <span key="two" id="two" />
      </CSSTransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);

    let leavingNode = ReactDOM.findDOMNode(a).childNodes[0];
    expect(hasClass(leavingNode, 'custom-leaving')).toBe(true);
  });

  it('should clear transition timeouts when unmounted', () => {
    class Component extends React.Component {
      render() {
        return (
          <CSSTransitionGroup
            transitionName="yolo"
            transitionEnterTimeout={500}
          >
            {this.props.children}
          </CSSTransitionGroup>
        );
      }
    }

    ReactDOM.render(<Component />, container);
    ReactDOM.render(<Component><span key="yolo" id="yolo" /></Component>, container);

    ReactDOM.unmountComponentAtNode(container);

    // Testing that no exception is thrown here, as the timeout has been cleared.
    jest.runAllTimers();
  });

  it('should handle unmounted elements properly', () => {
    class Child extends React.Component {
      render() {
        if (!this.props.show) {
          return null;
        }
        return <div />;
      }
    }

    class Component extends React.Component {
      state = { showChild: true };

      componentDidMount() {
        this.setState({ showChild: false });
      }

      render() {
        return (
          <CSSTransitionGroup
            transitionName="yolo"
            transitionAppear={true}
            transitionAppearTimeout={0}
          >
            <Child show={this.state.showChild} />
          </CSSTransitionGroup>
        );
      }
    }

    ReactDOM.render(<Component />, container);

    // Testing that no exception is thrown here, as the timeout has been cleared.
    jest.runAllTimers();
  });

  it('should work with custom component wrapper cloning children', () => {
    const extraClassNameProp = 'wrapper-item';
    class Wrapper extends React.Component {
      render() {
        return (
          <div>
            {
              React.Children.map(this.props.children,
                child => React.cloneElement(child, { className: extraClassNameProp }))
            }
          </div>
        );
      }
    }

    class Child extends React.Component {
      render() {
        return <div {...this.props} />;
      }
    }

    class Component extends React.Component {
      render() {
        return (
          <CSSTransitionGroup
            transitionName="yolo"
            component={Wrapper}
          >
            <Child />
          </CSSTransitionGroup>
        );
      }
    }

    const a = ReactDOM.render(<Component />, container);
    const child = ReactDOM.findDOMNode(a).childNodes[0];
    expect(hasClass(child, extraClassNameProp)).toBe(true);

    // Testing that no exception is thrown here, as the timeout has been cleared.
    jest.runAllTimers();
  });
});
