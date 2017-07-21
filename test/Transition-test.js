import React from 'react';
import ReactDOM from 'react-dom';
import tsp from 'teaspoon';
import sinon from 'sinon';

import Transition, { UNMOUNTED, EXITED, ENTERING, ENTERED, EXITING }
  from '../src/Transition';

jasmine.addMatchers({
  toExist: () => ({
    compare: actual => ({
      pass: actual != null,
    })
  })
});

describe('Transition', () => {
  it('should not transition on mount', () => {
    let instance = tsp(
      <Transition
        in
        timeout={0}
        onEnter={()=> { throw new Error('should not Enter'); }}
      >
        <div></div>
      </Transition>
    )
    .render()

    expect(instance.state('status')).toEqual(ENTERED);
  });

  it('should transition on mount with `appear`', done => {
    tsp(
      <Transition
        in
        timeout={0}
        onEnter={()=> { throw Error('Animated!') }}
      >
        <div />
      </Transition>
    )
    .render();

    tsp(
      <Transition
        in
        appear
        timeout={0}
        onEnter={()=> done()}
      >
        <div />
      </Transition>
    )
    .render();
  });

  it('should pass filtered props to children', () => {
    class Child extends React.Component {
      render() {
        return <div>child</div>;
      }
    }
    const child = tsp(
      <Transition
        foo="foo"
        bar="bar"
        in
        mountOnEnter
        unmountOnExit
        appear
        enter
        exit
        timeout={0}
        addEndListener={() => {}}
        onEnter={() => {}}
        onEntering={() => {}}
        onEntered={() => {}}
        onExit={() => {}}
        onExiting={() => {}}
        onExited={() => {}}
      >
        <Child />
      </Transition>
    )
    .render()
    .find(Child);

    expect(child.props()).toEqual({foo: 'foo',  bar: 'bar'});
  });

  it('should allow addEndListener instead of timeouts', done => {
    let listener = sinon.spy((node, end) => setTimeout(end, 0));

    let inst = tsp(
        <Transition
          addEndListener={listener}
          onEntered={() => {
            expect(listener.callCount).toEqual(1);
            done();
          }}
        >
          <div/>
        </Transition>
      )
      .render();

      inst.props('in', true);
  })

  it('should fallback to timeous with addEndListener ', done => {
    let calledEnd = false
    let listener = (node, end) => setTimeout(() => {
      calledEnd = true;
      end()
    }, 100);

    let inst = tsp(
        <Transition
          timeout={0}
          addEndListener={listener}
          onEntered={() => {
            expect(calledEnd).toEqual(false);
            done();
          }}
        >
          <div/>
        </Transition>
      )
      .render();

      inst.props('in', true);
  })

  describe('entering', () => {
    let instance;

    beforeEach(() => {
      instance = tsp(
        <Transition timeout={10}>
          <div/>
        </Transition>
      )
      .render();
    });

    it('should fire callbacks', done => {
      let onEnter = sinon.spy();
      let onEntering = sinon.spy();

      expect(instance.state('status')).toEqual(EXITED);

      instance.props({
        in: true,

        onEnter,

        onEntering,

        onEntered() {
          expect(onEnter.calledOnce).toEqual(true);
          expect(onEntering.calledOnce).toEqual(true);
          expect(onEnter.calledBefore(onEntering)).toEqual(true);
          done();
        }
      });
    });

    it('should move to each transition state', done => {
      let count = 0;

      expect(instance.state('status')).toEqual(EXITED);

      instance.props({
        in: true,

        onEnter(){
          count++;
          expect(instance.state('status')).toEqual(EXITED);
        },

        onEntering(){
          count++;
          expect(instance.state('status')).toEqual(ENTERING);
        },

        onEntered(){
          expect(instance.state('status')).toEqual(ENTERED);
          expect(count).toEqual(2);
          done();
        }
      });
    });
  });

  describe('exiting', ()=> {
    let instance;

    beforeEach(() => {
      instance = tsp(
        <Transition in timeout={10}>
          <div/>
        </Transition>
      )
      .render();
    });

    it('should fire callbacks', done => {
      let onExit = sinon.spy();
      let onExiting = sinon.spy();

      expect(instance.state('status')).toEqual(ENTERED);

      instance.props({
        in: false,

        onExit,

        onExiting,

        onExited(){
          expect(onExit.calledOnce).toEqual(true);
          expect(onExiting.calledOnce).toEqual(true);
          expect(onExit.calledBefore(onExiting)).toEqual(true);
          done();
        }
      });
    });

    it('should move to each transition state', done => {
      let count = 0;

      expect(instance.state('status')).toEqual(ENTERED);

      instance.props({
        in: false,

        onExit(){
          count++;
          expect(instance.state('status')).toEqual(ENTERED);
        },

        onExiting(){
          count++;
          expect(instance.state('status')).toEqual(EXITING);
        },

        onExited(){
          expect(instance.state('status')).toEqual(EXITED);
          expect(count).toEqual(2);
          done();
        }
      });
    });
  });

  describe('mountOnEnter', () => {
    class MountTransition extends React.Component {
      constructor(props) {
        super(props);
        this.state = {in: props.initialIn};
      }

      render() {
        const { ...props } = this.props;
        delete props.initialIn;

        return (
          <Transition
            ref="transition"
            mountOnEnter
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div />
          </Transition>
        );
      }

      getStatus = () => {
        return this.refs.transition.state.status;
      }
    }

    it('should mount when entering', done => {
      const instance = tsp(
        <MountTransition
          initialIn={false}
          onEnter={() => {
            expect(instance.unwrap().getStatus()).toEqual(EXITED);
            expect(instance.dom()).toExist();
            done();
          }}
        />
      )
      .render();

      expect(instance.unwrap().getStatus()).toEqual(UNMOUNTED);

      expect(instance.dom()).not.toExist();

      instance.props({ in: true });
    });

    it('should stay mounted after exiting', done => {
      const instance = tsp(
        <MountTransition
          initialIn={false}
          onEntered={() => {
            expect(instance.unwrap().getStatus()).toEqual(ENTERED);
            expect(instance.dom()).toExist();

            instance.state({ in: false });
          }}
          onExited={() => {
            expect(instance.unwrap().getStatus()).toEqual(EXITED);
            expect(instance.dom()).toExist();

            done();
          }}
        />
      )
      .render();

      expect(instance.dom()).not.toExist();
      instance.state({ in: true });
    });
  })

  describe('unmountOnExit', () => {
    class UnmountTransition extends React.Component {
      constructor(props) {
        super(props);

        this.state = {in: props.initialIn};
      }

      render() {
        const { ...props } = this.props;
        delete props.initialIn;

        return (
          <Transition
            ref="transition"
            unmountOnExit
            in={this.state.in}
            timeout={10}
            {...props}
          >
            <div />
          </Transition>
        );
      }

      getStatus = () => {
        return this.refs.transition.state.status;
      }
    }

    it('should mount when entering', done => {
      const instance = tsp(
        <UnmountTransition
          initialIn={false}
          onEnter={() => {
            expect(instance.getStatus()).toEqual(EXITED);
            expect(ReactDOM.findDOMNode(instance)).toExist();

            done();
          }}
        />
      )
      .render()
      .unwrap();

      expect(instance.getStatus()).toEqual(UNMOUNTED);
      expect(ReactDOM.findDOMNode(instance)).toBeNull();

      instance.setState({in: true});
    });

    it('should unmount after exiting', done => {
      const instance = tsp(
        <UnmountTransition
          initialIn
          onExited={() => {
            expect(instance.getStatus()).toEqual(UNMOUNTED);
            expect(ReactDOM.findDOMNode(instance)).not.toExist();

            done();
          }}
        />
      )
      .render()
      .unwrap();

      expect(instance.getStatus()).toEqual(ENTERED);
      expect(ReactDOM.findDOMNode(instance)).toExist();

      instance.setState({in: false});
    });
  });
});
