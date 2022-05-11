import React from 'react';
import * as ChildMapping from '../src/utils/ChildMapping';

describe('ChildMapping', () => {
  it('should support getChildMapping', () => {
    let oneone = <div key="oneone" />;
    let onetwo = <div key="onetwo" />;
    let one = (
      <div key="one">
        {oneone}
        {onetwo}
      </div>
    );
    let two = <div key="two">foo</div>;
    let component = (
      <div>
        {one}
        {two}
      </div>
    );

    let mapping = ChildMapping.getChildMapping(component.props.children);

    expect(mapping['.$one'].props).toEqual(one.props);
    expect(mapping['.$two'].props).toEqual(two.props);
  });

  it('should support mergeChildMappings for adding keys', () => {
    let prev = {
      one: 'one',
      two: 'two',
    };
    let next = {
      one: 'one',
      two: 'two',
      three: 'three',
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: 'one',
      two: 'two',
      three: 'three',
    });
  });

  it('should support mergeChildMappings for removing keys', () => {
    let prev = {
      one: 'one',
      two: 'two',
      three: 'three',
    };
    let next = {
      one: 'one',
      two: 'two',
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: 'one',
      two: 'two',
      three: 'three',
    });
  });

  it('should support mergeChildMappings for adding and removing', () => {
    let prev = {
      one: 'one',
      two: 'two',
      three: 'three',
    };
    let next = {
      one: 'one',
      two: 'two',
      four: 'four',
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
    });
  });

  it('should reconcile overlapping insertions and deletions', () => {
    let prev = {
      one: 'one',
      two: 'two',
      four: 'four',
      five: 'five',
    };
    let next = {
      one: 'one',
      two: 'two',
      three: 'three',
      five: 'five',
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five',
    });
  });

  it('should support mergeChildMappings with undefined input', () => {
    const prev = {
      one: 'one',
      two: 'two',
    };

    const next = undefined;

    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: 'one',
      two: 'two',
    });

    const prev2 = undefined;

    const next2 = {
      three: 'three',
      four: 'four',
    };

    expect(ChildMapping.mergeChildMappings(prev2, next2)).toEqual({
      three: 'three',
      four: 'four',
    });
  });
});
