import hasClass from 'dom-helpers/hasClass';
import CSSTransition from '../src/CSSTransition';

let React;
let ReactDOM;
let TransitionGroup;
let act;
let render;

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('CSSTransitionGroup', () => {
  let container;
  let consoleErrorSpy;

  function YoloTransition({ id, ...props }) {
    const nodeRef = React.useRef();
    return (
      <CSSTransition nodeRef={nodeRef} classNames="yolo" timeout={0} {...props}>
        <span ref={nodeRef} id={id} />
      </CSSTransition>
    );
  }

  beforeEach(() => {
    jest.resetModuleRegistry();
    jest.useFakeTimers();

    React = require('react');
    ReactDOM = require('react-dom');
    const testUtils = require('./utils');
    act = testUtils.act;
    const baseRender = testUtils.render;

    render = (element, container) =>
      baseRender(<React.StrictMode>{element}</React.StrictMode>, { container });

    TransitionGroup = require('../src/TransitionGroup');

    container = document.createElement('div');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  it('should clean-up silently after the timeout elapses', () => {
    render(
      <TransitionGroup enter={false}>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container
    );

    const transitionGroupDiv = container.childNodes[0];

    expect(transitionGroupDiv.childNodes.length).toBe(1);

    render(
      <TransitionGroup enter={false}>
        <YoloTransition key="two" id="two" />
      </TransitionGroup>,
      container
    );

    expect(transitionGroupDiv.childNodes.length).toBe(2);
    expect(transitionGroupDiv.childNodes[0].id).toBe('two');
    expect(transitionGroupDiv.childNodes[1].id).toBe('one');

    act(() => {
      jest.runAllTimers();
    });

    // No warnings
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // The leaving child has been removed
    expect(transitionGroupDiv.childNodes.length).toBe(1);
    expect(transitionGroupDiv.childNodes[0].id).toBe('two');
  });

  it('should keep both sets of DOM nodes around', () => {
    render(
      <TransitionGroup>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container
    );

    const transitionGroupDiv = container.childNodes[0];

    expect(transitionGroupDiv.childNodes.length).toBe(1);

    render(
      <TransitionGroup>
        <YoloTransition key="two" id="two" />
      </TransitionGroup>,
      container
    );

    expect(transitionGroupDiv.childNodes.length).toBe(2);
    expect(transitionGroupDiv.childNodes[0].id).toBe('two');
    expect(transitionGroupDiv.childNodes[1].id).toBe('one');
  });

  it('should switch transitionLeave from false to true', () => {
    render(
      <TransitionGroup enter={false} leave={false}>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container
    );

    const transitionGroupDiv = container.childNodes[0];

    expect(transitionGroupDiv.childNodes.length).toBe(1);

    render(
      <TransitionGroup enter={false} leave={false}>
        <YoloTransition key="two" id="two" />
      </TransitionGroup>,
      container
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(transitionGroupDiv.childNodes.length).toBe(1);

    render(
      <TransitionGroup enter={false} leave>
        <YoloTransition key="three" id="three" />
      </TransitionGroup>,
      container
    );

    expect(transitionGroupDiv.childNodes.length).toBe(2);
    expect(transitionGroupDiv.childNodes[0].id).toBe('three');
    expect(transitionGroupDiv.childNodes[1].id).toBe('two');
  });

  it('should work with a null child', () => {
    render(<TransitionGroup>{[null]}</TransitionGroup>, container);
  });

  it('should work with a child which renders as null', () => {
    const NullComponent = () => null;
    // Testing the whole lifecycle of entering and exiting,
    // because those lifecycle methods used to fail when the DOM node was null.
    render(<TransitionGroup />, container);
    render(
      <TransitionGroup>
        <CSSTransition classNames="yolo" timeout={0}>
          <NullComponent />
        </CSSTransition>
      </TransitionGroup>,
      container
    );
    render(<TransitionGroup />, container);
  });

  it('should transition from one to null', () => {
    render(
      <TransitionGroup>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container
    );

    const transitionGroupDiv = container.childNodes[0];

    expect(transitionGroupDiv.childNodes.length).toBe(1);

    render(<TransitionGroup>{null}</TransitionGroup>, container);

    // (Here, we expect the original child to stick around but test that no
    // exception is thrown)
    expect(transitionGroupDiv.childNodes.length).toBe(1);
    expect(transitionGroupDiv.childNodes[0].id).toBe('one');
  });

  it('should transition from false to one', () => {
    render(<TransitionGroup>{false}</TransitionGroup>, container);

    const transitionGroupDiv = container.childNodes[0];

    expect(transitionGroupDiv.childNodes.length).toBe(0);

    render(
      <TransitionGroup>
        <YoloTransition key="one" id="one" />
      </TransitionGroup>,
      container
    );

    expect(transitionGroupDiv.childNodes.length).toBe(1);
    expect(transitionGroupDiv.childNodes[0].id).toBe('one');
  });

  it('should clear transition timeouts when unmounted', () => {
    class Component extends React.Component {
      render() {
        return <TransitionGroup>{this.props.children}</TransitionGroup>;
      }
    }

    render(<Component />, container);
    render(
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

    render(<Component />, container);

    // Testing that no exception is thrown here, as the timeout has been cleared.
    act(() => {
      jest.runAllTimers();
    });
  });

  it('should work with custom component wrapper cloning children', () => {
    const extraClassNameProp = 'wrapper-item';
    class Wrapper extends React.Component {
      render() {
        return (
          <div>
            {React.Children.map(this.props.children, (child) =>
              React.cloneElement(child, { className: extraClassNameProp })
            )}
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
          <TransitionGroup component={Wrapper}>
            <Child />
          </TransitionGroup>
        );
      }
    }

    render(<Component />, container);
    const transitionGroupDiv = container.childNodes[0];
    transitionGroupDiv.childNodes.forEach((child) => {
      expect(hasClass(child, extraClassNameProp)).toBe(true);
    });

    // Testing that no exception is thrown here, as the timeout has been cleared.
    act(() => {
      jest.runAllTimers();
    });
  });
});
