import React from 'react';
import tsp from 'teaspoon';

import CSSTransition from '../src/CSSTransition';

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
      <CSSTransition
        in={false}
        timeout={0}
        classNames="test"
        onEnter={node => {
          expect(node.classList.contains('test-class')).toEqual(true)
          expect(node.classList.contains('test-entering')).toEqual(false)
          done()
        }}
      >
        <div></div>
      </CSSTransition>
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
        <CSSTransition
          timeout={10}
          classNames="test"
        >
          <div/>
        </CSSTransition>
      )
      .render();
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      instance.props({
        in: true,

        onEnter(node){
          count++;
          expect(node.className).toEqual('test-enter');
        },

        onEntering(node){
          count++;
          expect(node.className).toEqual('test-enter test-enter-active');
        },

        onEntered(node){
          expect(node.className).toEqual('');
          expect(count).toEqual(2);
          done();
        }
      });
    });

    it('should apply custom classNames names', done => {
      let count = 0;
      instance = tsp(
        <CSSTransition
          timeout={10}
          classNames={{
            enter: 'custom',
            enterActive: 'custom-super-active',
          }}
        >
          <div/>
        </CSSTransition>
      )
      .render();

      instance.props({
        in: true,

        onEnter(node){
          count++;
          expect(node.className).toEqual('custom');
        },

        onEntering(node){
          count++;
          expect(node.className).toEqual('custom custom-super-active');
        },

        onEntered(node){
          expect(node.className).toEqual('');
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
        <CSSTransition
          in
          timeout={10}
          classNames="test"
        >
          <div/>
        </CSSTransition>
      )
      .render();
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      instance.props({
        in: false,

        onExit(node){
          count++;
          expect(node.className).toEqual('test-exit');
        },

        onExiting(node){
          count++;
          expect(node.className).toEqual('test-exit test-exit-active');
        },

        onExited(node){
          expect(node.className).toEqual('');
          expect(count).toEqual(2);
          done();
        }
      });
    });

    it('should apply custom classNames names', done => {
      let count = 0;
      instance = tsp(
        <CSSTransition
          in
          timeout={10}
          classNames={{
            exit: 'custom',
            exitActive: 'custom-super-active',
          }}
        >
          <div/>
        </CSSTransition>
      )
      .render();

      instance.props({
        in: false,

        onExit(node){
          count++;
          expect(node.className).toEqual('custom');
        },

        onExiting(node){
          count++;
          expect(node.className).toEqual('custom custom-super-active');
        },

        onExited(node){
          expect(node.className).toEqual('');
          expect(count).toEqual(2);
          done();
        }
      });
    });
  });
});
