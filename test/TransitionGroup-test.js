let React;
let TransitionGroup;
let Transition;

// Most of the real functionality is covered in other unit tests, this just
// makes sure we're wired up correctly.
describe('TransitionGroup', () => {
  let act, container, log, Child, renderStrict, render;

  beforeEach(() => {
    React = require('react');
    Transition = require('../src/Transition').default;
    TransitionGroup = require('../src/TransitionGroup');
    const testUtils = require('./utils');
    act = testUtils.act;
    render = testUtils.render;

    renderStrict = (element, container) =>
      render(<React.StrictMode>{element}</React.StrictMode>, { container });

    container = document.createElement('div');

    log = [];
    let events = {
      onEnter: (m) => log.push(m ? 'appear' : 'enter'),
      onEntering: (m) => log.push(m ? 'appearing' : 'entering'),
      onEntered: (m) => log.push(m ? 'appeared' : 'entered'),
      onExit: () => log.push('exit'),
      onExiting: () => log.push('exiting'),
      onExited: () => log.push('exited'),
    };

    const nodeRef = React.createRef();
    Child = function Child(props) {
      return (
        <Transition nodeRef={nodeRef} timeout={0} {...props} {...events}>
          <span ref={nodeRef} />
        </Transition>
      );
    };
  });

  it('should allow null components', () => {
    function FirstChild(props) {
      const childrenArray = React.Children.toArray(props.children);
      return childrenArray[0] || null;
    }

    render(
      <TransitionGroup component={FirstChild}>
        <Child />
      </TransitionGroup>
    );
  });

  it('should allow callback refs', () => {
    const ref = jest.fn();

    class Child extends React.Component {
      render() {
        return <span />;
      }
    }

    render(
      <TransitionGroup>
        <Child ref={ref} />
      </TransitionGroup>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('should work with no children', () => {
    renderStrict(<TransitionGroup />, container);
  });

  it('should handle transitioning correctly', () => {
    function Parent({ count = 1 }) {
      let children = [];
      for (let i = 0; i < count; i++) children.push(<Child key={i} />);
      return (
        <TransitionGroup appear enter exit>
          {children}
        </TransitionGroup>
      );
    }

    jest.useFakeTimers();
    renderStrict(<Parent />, container);

    act(() => {
      jest.runAllTimers();
    });
    expect(log).toEqual(['appear', 'appearing', 'appeared']);

    log = [];
    renderStrict(<Parent count={2} />, container);
    act(() => {
      jest.runAllTimers();
    });
    expect(log).toEqual(['enter', 'entering', 'entered']);

    log = [];
    renderStrict(<Parent count={1} />, container);
    act(() => {
      jest.runAllTimers();
    });
    expect(log).toEqual(['exit', 'exiting', 'exited']);
  });
});
