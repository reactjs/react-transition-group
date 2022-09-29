import { render as baseRender } from '@testing-library/react/pure';

export * from '@testing-library/react';
export function render(element, options) {
  const result = baseRender(element, options);

  return {
    ...result,
    setProps(props) {
      result.rerender(React.cloneElement(element, props));
    },
  };
}
