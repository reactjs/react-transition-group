let React;
let ChildMapping;

describe('ChildMapping', () => {
  beforeEach(() => {
    React = require('react');
    ChildMapping = require('../src/utils/ChildMapping');
  });

  it('should support getChildMapping', () => {
    let oneone = <div key="oneone" />;
    let onetwo = <div key="onetwo" />;
    let one = <div key="one">{oneone}{onetwo}</div>;
    let two = <div key="two">foo</div>;
    let component = <div>{one}{two}</div>;

    let mapping = ChildMapping.getChildMapping(component.props.children);

    expect(mapping['.$one'].props).toEqual(one.props);
    expect(mapping['.$two'].props).toEqual(two.props);
  });

  it('should support mergeChildMappings for adding keys', () => {
    let prev = {
      one: true,
      two: true,
    };
    let next = {
      one: true,
      two: true,
      three: true,
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: true,
      two: true,
      three: true,
    });
  });

  it('should support mergeChildMappings for removing keys', () => {
    let prev = {
      one: true,
      two: true,
      three: true,
    };
    let next = {
      one: true,
      two: true,
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: true,
      two: true,
      three: true,
    });
  });

  it('should support mergeChildMappings for adding and removing', () => {
    let prev = {
      one: true,
      two: true,
      three: true,
    };
    let next = {
      one: true,
      two: true,
      four: true,
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: true,
      two: true,
      three: true,
      four: true,
    });
  });

  it('should reconcile overlapping insertions and deletions', () => {
    let prev = {
      one: true,
      two: true,
      four: true,
      five: true,
    };
    let next = {
      one: true,
      two: true,
      three: true,
      five: true,
    };
    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: true,
      two: true,
      three: true,
      four: true,
      five: true,
    });
  });

  it('should support mergeChildMappings with undefined input', () => {
    let prev = {
      one: true,
      two: true,
    };

    let next;

    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: true,
      two: true,
    });

    prev = undefined;

    next = {
      three: true,
      four: true,
    };

    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      three: true,
      four: true,
    });
  });
});
