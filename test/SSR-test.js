/**
 * @jest-environment node
 */

// test that import does not crash
import * as ReactTransitionGroup from '../src'; // eslint-disable-line no-unused-vars

describe('SSR', () => {
  it('should import react-transition-group in node env', () => {});
});
