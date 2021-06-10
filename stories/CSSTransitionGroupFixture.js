import React from 'react';

import TransitionGroup from '../src/TransitionGroup';
import StoryFixture from './StoryFixture';

class CSSTransitionGroupFixture extends React.Component {
  static defaultProps = {
    items: [],
  };

  count = this.props.items.length;
  state = {
    items: this.props.items,
  };

  handleAddItem = () => {
    this.setState(({ items }) => ({
      items: [...items, `Item number: ${++this.count}`],
    }));
  };

  handleRemoveItems = () => {
    this.setState(({ items }) => {
      items = items.slice();
      items.splice(1, 3);
      return { items };
    });
  };

  handleRemoveItem = (item) => {
    this.setState(({ items }) => ({
      items: items.filter((i) => i !== item),
    }));
  };

  render() {
    const { items: _, description, children, ...rest } = this.props;
    // e.g. `Fade`, see where `CSSTransitionGroupFixture` is used
    const { type: TransitionType, props: transitionTypeProps } =
      React.Children.only(children);

    return (
      <StoryFixture description={description}>
        <div style={{ marginBottom: 10 }}>
          <button onClick={this.handleAddItem}>Add Item</button>{' '}
          <button onClick={this.handleRemoveItems}>Remove a few</button>
        </div>
        <TransitionGroup component="div" {...rest}>
          {this.state.items.map((item) => (
            <TransitionType {...transitionTypeProps} key={item}>
              {item}
              <button onClick={() => this.handleRemoveItem(item)}>
                &times;
              </button>
            </TransitionType>
          ))}
        </TransitionGroup>
      </StoryFixture>
    );
  }
}

export default CSSTransitionGroupFixture;
