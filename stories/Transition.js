import React from 'react';
import { storiesOf } from '@storybook/react';

import { Fade, Collapse } from './transitions/Bootstrap'
import JavascriptTransition from './transitions/JavaScriptTransition';
import StoryFixture from './StoryFixture';


class ToggleFixture extends React.Component {
  state = { show: this.props.defaultIn }
  render() {
    return (
      <StoryFixture description={this.props.description}>
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => this.setState(({ show }) => ({
              show: !show
            }))}
          >
            Toggle
          </button>
        </div>
        {React.cloneElement(this.props.children, {
          in: this.state.show
        })}
      </StoryFixture>
    )
  }
}

storiesOf('Transition', module)
  .add('Bootstrap Fade', () => (
    <ToggleFixture>
      <Fade>
        <div>asaghasg asgasg</div>
      </Fade>
    </ToggleFixture>
  ))
  .add('Bootstrap Collapse', () => (
    <ToggleFixture>
      <Collapse>
        <div>
          asaghasg asgasg
          <div>foo</div>
          <div>bar</div>
        </div>
      </Collapse>
    </ToggleFixture>
  ))
  .add('Javascript Transition', () => (
    <ToggleFixture>
      <JavascriptTransition />
    </ToggleFixture>
  ));

