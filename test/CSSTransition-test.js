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

describe('CSSTransition', () => {

  it('should flush new props to the DOM before initiating a transition', (done) => {
    tsp(
      <Transition
        in={false}
        timeout={0}
        enteringClassName='test-entering'
        onEnter={node => {
          expect(node.classList.contains('test-class')).toEqual(true)
          expect(node.classList.contains('test-entering')).toEqual(false)
          done()
        }}
      >
        <div></div>
      </Transition>
    )
    .render()
    .tap(inst => {
      expect(inst.dom().classList.contains('test-class')).toEqual(false)
    })
    .props({
      in: true,
      className: 'test-class'
    })
  });

  describe('entering', () => {
    let instance;

    beforeEach(() => {
      instance = tsp(
        <Transition
          timeout={10}
          enteredClassName='test-enter'
          enteringClassName='test-entering'
        >
          <div/>
        </Transition>
      )
      .render();
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      expect(instance.state('status')).toEqual(EXITED);

      instance.props({
        in: true,

        onEnter(node){
          count++;
          expect(node.className).toEqual('');
        },

        onEntering(node){
          count++;
          expect(node.className).toEqual('test-entering');
        },

        onEntered(node){
          expect(node.className).toEqual('test-enter');
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
        <Transition
          in
          timeout={10}
          exitedClassName='test-exit'
          exitingClassName='test-exiting'
        >
          <div/>
        </Transition>
      )
      .render();
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      expect(instance.state('status')).toEqual(ENTERED);

      instance.props({
        in: false,

        onExit(node){
          count++;
          expect(node.className).toEqual('');
        },

        onExiting(node){
          count++;
          expect(node.className).toEqual('test-exiting');
        },

        onExited(node){
          expect(node.className).toEqual('test-exit');
          expect(count).toEqual(2);
          done();
        }
      });
    });
  });
});
