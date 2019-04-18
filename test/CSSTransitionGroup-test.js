import hasClass from 'dom-helpers/class/hasClass';
import CSSTransition from '../src/CSSTransition';

let React;
let ReactDOM;
let TransitionGroup;

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('CSSTransitionGroup', () => {
  let container;
  let consoleErrorSpy;

  function YoloTransition({ id, ...props }) {
    return (
      <CSSTransition classNames="yolo" timeout={0} {...props}>
        <span id={id} />
      </CSSTransition>
    )
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    jest.useFakeTimers();

    React = require('react');
    ReactDOM = require('react-dom');

    TransitionGroup = require('../src/TransitionGroup');

    container = document.createElement('div');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });


  it('should clean-up silently after the timeout elapses', () => {
    let a = ReactDOM.render(
      <TransitionGroup enter={false}>
        <YoloTransition key="one" id="one"/>
      </TransitionGroup>,
      container,
    );

    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);

    ReactDOM.render(
      <TransitionGroup enter={false}>
        <YoloTransition key="two" id="two"/>
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('two');
    expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('one');

    jest.runAllTimers();

    // No warnings
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // The leaving child has been removed
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('two');
  });

  it('should keep both sets of DOM nodes around', () => {
    let a = ReactDOM.render(
      <TransitionGroup>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <TransitionGroup>
        <YoloTransition key="two" id="two" />
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('two');
    expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('one');
  });

  it('should switch transitionLeave from false to true', () => {
    let a = ReactDOM.render(
      <TransitionGroup enter={false} leave={false}>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <TransitionGroup enter={false} leave={false}>
        <YoloTransition key="two" id="two" />
      </TransitionGroup>,
      container,
    );

    jest.runAllTimers();
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <TransitionGroup enter={false} leave>
        <YoloTransition key="three" id="three" />
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(2);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('three');
    expect(ReactDOM.findDOMNode(a).childNodes[1].id).toBe('two');
  });


  it('should work with a null child', () => {
    ReactDOM.render(
      <TransitionGroup>
        {[null]}
      </TransitionGroup>,
      container,
    );
  });

  it('should work with a child which renders as null', () => {
    const NullComponent = () => null;
    // Testing the whole lifecycle of entering and exiting,
    // because those lifecycle methods used to fail when the DOM node was null.
    ReactDOM.render(
      <TransitionGroup/>,
      container,
    );
    ReactDOM.render(
      <TransitionGroup>
        <CSSTransition classNames="yolo" timeout={0}>
          <NullComponent/>
        </CSSTransition>
      </TransitionGroup>,
      container,
    );
    ReactDOM.render(
      <TransitionGroup/>,
      container,
    );
  });

  it('should transition from one to null', () => {
    let a = ReactDOM.render(
      <TransitionGroup>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    ReactDOM.render(
      <TransitionGroup>
        {null}
      </TransitionGroup>,
      container,
    );
    // (Here, we expect the original child to stick around but test that no
    // exception is thrown)
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('one');
  });

  it('should transition from false to one', () => {
    let a = ReactDOM.render(
      <TransitionGroup>
        {false}
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(0);
    ReactDOM.render(
      <TransitionGroup>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container,
    );
    expect(ReactDOM.findDOMNode(a).childNodes.length).toBe(1);
    expect(ReactDOM.findDOMNode(a).childNodes[0].id).toBe('one');
  });

  it('should clear transition timeouts when unmounted', () => {
    class Component extends React.Component {
      render() {
        return (
          <TransitionGroup>
            {this.props.children}
          </TransitionGroup>
        );
      }
    }

    ReactDOM.render(<Component />, container);
    ReactDOM.render(
      <Component>
        <YoloTransition key="yolo" id="yolo" />
      </Component>,
      container
    );

    ReactDOM.unmountComponentAtNode(container);

    // Testing that no exception is thrown here, as the timeout has been cleared.
    jest.runAllTimers();
  });

  it('should handle unmounted elements properly', () => {
    class Child extends React.Component {
      render() {
        if (!this.props.show) return null;
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
          <TransitionGroup appear={true}>
            <Child show={this.state.showChild} />
          </TransitionGroup>
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
          <TransitionGroup
            component={Wrapper}
          >
            <Child />
          </TransitionGroup>
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
