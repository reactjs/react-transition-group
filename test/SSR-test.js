/**
 * @jest-environment node
 */

// test that import does not crash
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as ReactTransitionGroup from '../src'; // eslint-disable-line no-unused-vars

describe('SSR', () => {
  it('should import react-transition-group in node env', () => {});
});
