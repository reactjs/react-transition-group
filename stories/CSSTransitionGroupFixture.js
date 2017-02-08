import React from 'react';

import CSSTransitionGroup from '../src/CSSTransitionGroup';
import StoryFixture from './StoryFixture';

class CSSTransitionGroupFixture extends React.Component {
  constructor(props, context) {
    super(props, context);

    let items = props.items || [];

    this.count = items.length;
    this.state = {
      items,
    };
  }
  handleAddItem = () => {
    this.setState(({ items }) => ({
      items: [
        ...items,
        `Item number: ${++this.count}`,
      ],
    }));
  }

  handleRemoveItems = () => {
    this.setState(({ items }) => {
      items = items.slice();
      items.splice(1, 3);
      return { items };
    });
  }

  handleRemoveItem = (item) => {
    this.setState(({ items }) => ({
      items: items.filter(i => i !== item),
    }));
  }

  render() {
    const { items: _, description, ...props } = this.props;

    return (
      <StoryFixture description={description}>
        <div style={{ marginBottom: 10 }}>
          <button onClick={this.handleAddItem}>
            Add Item
          </button>
          {' '}
          <button onClick={this.handleRemoveItems}>
            Remove a few
          </button>
        </div>
        <CSSTransitionGroup component="div" {...props}>
          {this.state.items.map(item => (
            <div key={item}>
              {item}
              <button onClick={() => this.handleRemoveItem(item)}>
                &times;
              </button>
            </div>
          ))}
        </CSSTransitionGroup>
      </StoryFixture>
    );
  }
}

export default CSSTransitionGroupFixture;
