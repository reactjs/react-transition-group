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

  it('should ignore inherited keys in the previous mapping', () => {
    let prev = Object.create({ inherited: { unexpected: true } });
    prev.one = true;
    let next = { two: true };

    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: true,
      two: true,
    });
  });

  it('should ignore inherited keys in the next mapping', () => {
    let prev = { one: true };
    let next = Object.create({ inherited: { unexpected: true } });
    next.two = true;

    expect(ChildMapping.mergeChildMappings(prev, next)).toEqual({
      one: true,
      two: true,
    });
  });

  it('should preserve previous own entries shadowed by the next prototype', () => {
    let prev = { one: 'previous', two: true };
    let next = Object.create({ one: 'inherited' });
    next.two = true;

    let merged = ChildMapping.mergeChildMappings(prev, next);

    expect(merged.one).toBe('previous');
    expect(Object.keys(merged)).toEqual(['one', 'two']);
  });

  it('should preserve own entries named after Object.prototype properties', () => {
    let prev = Object.create(null);
    Object.defineProperty(prev, '__proto__', {
      enumerable: true,
      value: 'previous',
    });
    prev.constructor = 'constructor';
    let next = Object.create(null);
    next.hasOwnProperty = 'hasOwnProperty';

    let merged = ChildMapping.mergeChildMappings(prev, next);

    expect(Object.keys(merged)).toEqual([
      'hasOwnProperty',
      '__proto__',
      'constructor',
    ]);
    expect(Object.getOwnPropertyDescriptor(merged, '__proto__').value).toBe(
      'previous'
    );
    expect(merged.constructor).toBe('constructor');
    expect(merged.hasOwnProperty).toBe('hasOwnProperty');
  });

  it('should treat a child inherited by the previous mapping as new', () => {
    let child = <div key="one" />;
    let props = { children: child, enter: true, exit: true };
    let prev = Object.create({ '.$one': { unexpected: true } });

    let next = ChildMapping.getNextChildMapping(props, prev, () => {});

    expect(next['.$one'].props.in).toBe(true);
    expect(next['.$one'].props.enter).toBe(true);
    expect(next['.$one'].props.exit).toBe(true);
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
