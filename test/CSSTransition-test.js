import React from 'react';
import { mount } from 'enzyme';

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
    mount(
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
    .tap(inst => {

      expect(inst.getDOMNode().classList.contains('test-class')).toEqual(false)
    })
    .setProps({
      in: true,
      className: 'test-class'
    })
  });

  describe('entering', () => {
    let instance;

    beforeEach(() => {
      instance = mount(
        <CSSTransition
          timeout={10}
          classNames="test"
        >
          <div/>
        </CSSTransition>
      )
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      instance.setProps({
        in: true,

        onEnter(node) {
          count++;
          expect(node.className).toEqual('test-enter');
        },

        onEntering(node){
          count++;
          expect(node.className).toEqual('test-enter test-enter-active');
        },

        onEntered(node){
          expect(node.className).toEqual('test-enter-done');
          expect(count).toEqual(2);
          done();
        }
      });
    });

    it('should apply custom classNames names', done => {
      let count = 0;
      instance = mount(
        <CSSTransition
          timeout={10}
          classNames={{
            enter: 'custom',
            enterActive: 'custom-super-active',
            enterDone: 'custom-super-done',
          }}
        >
          <div/>
        </CSSTransition>
      )
        .render();

      instance.setProps({
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
          expect(node.className).toEqual('custom-super-done');
          expect(count).toEqual(2);
          done();
        }
      });
    });

    describe('isAppearing', () => {

      it('should be false', done => {

        instance = tsp(
          <CSSTransition
            timeout={10}
            classNames="test"
          >
            <div/>
          </CSSTransition>
        )
          .render();


        instance.props({
          in: true,
          onEnter(node, isAppearing){
            expect(isAppearing).toEqual(false);
          },

          onEntering(node, isAppearing){
            expect(isAppearing).toEqual(false);
          },

          onEntered(node, isAppearing){
            expect(isAppearing).toEqual(false);
            done();
          }
        });
      });

      it('should be true', done => {

        instance = tsp(
          <CSSTransition
            timeout={10}
            appear={true}
            in={true}
            classNames="test"
          >
            <div/>
          </CSSTransition>
        )
          .render();

        instance.props({
          onEnter(node, isAppearing){
            expect(isAppearing).toEqual(true);
          },

          onEntering(node, isAppearing){
            expect(isAppearing).toEqual(true);
          },

          onEntered(node, isAppearing){
            expect(isAppearing).toEqual(true);
            done();
          }
        });
      });

    });
  });

  describe('exiting', ()=> {
    let instance;

    beforeEach(() => {
      instance = mount(
        <CSSTransition
          in
          timeout={10}
          classNames="test"
        >
          <div/>
        </CSSTransition>
      )
    });

    it('should apply classes at each transition state', done => {
      let count = 0;

      instance.setProps({
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
          expect(node.className).toEqual('test-exit-done');
          expect(count).toEqual(2);
          done();
        }
      });
    });

    it('should apply custom classNames names', done => {
      let count = 0;
      instance = mount(
        <CSSTransition
          in
          timeout={10}
          classNames={{
            exit: 'custom',
            exitActive: 'custom-super-active',
            exitDone: 'custom-super-done',
          }}
        >
          <div/>
        </CSSTransition>
      );

      instance.setProps({
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
          expect(node.className).toEqual('custom-super-done');
          expect(count).toEqual(2);
          done();
        }
      });
    });
  });
});
