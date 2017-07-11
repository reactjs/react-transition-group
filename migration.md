
## Migrating from v1 to v2

A few notes to help with migrating from `v1` to `v2`

### CSSTransitionGroup migration guide

The `CSSTransitonGroup` has been removed, and a `CSSTransition` component has
been added and can be used with the new `TransitionGroup` component to accomplish the same tasks.

**tl;dr;**

- `transitionName` -> `classNames`
- `transitionEnterTimeout` and `transitionLeaveTimeout` -> `timeout={{ exit, enter }}`
- `transitionAppear` -> `appear`
- `transitionEnter` -> `enter`
- `transitionLeave` -> `exit`

Lets take the original docs example and migrate it:

```css
.example-enter {
  opacity: 0.01;
}

.example-enter.example-enter-active {
  opacity: 1;
  transition: opacity 500ms ease-in;
}

.example-leave {
  opacity: 1;
}

.example-leave.example-leave-active {
  opacity: 0.01;
  transition: opacity 300ms ease-in;
}
```

And the component:

```js
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items: ['hello', 'world', 'click', 'me']};
    this.handleAdd = this.handleAdd.bind(this);
  }

  handleAdd() {
    const newItems = this.state.items.concat([
      prompt('Enter some text')
    ]);
    this.setState({items: newItems});
  }

  handleRemove(i) {
    let newItems = this.state.items.slice();
    newItems.splice(i, 1);
    this.setState({items: newItems});
  }

  render() {
    const items = this.state.items.map((item, i) => (
      <div key={item} onClick={() => this.handleRemove(i)}>
        {item}
      </div>
    ));

    return (
      <div>
        <button onClick={this.handleAdd}>Add Item</button>
        <CSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {items}
        </CSSTransitionGroup>
      </div>
    );
  }
}
```

The most straightforward way to migrate is to use `TransitionGroup` instead of
`CSSTransitionGroup`

```diff
render() {
  const items = this.state.items.map((item, i) => (
    <div key={item} onClick={() => this.handleRemove(i)}>
      {item}
    </div>
  ));

  return (
    <div>
      <button onClick={this.handleAdd}>Add Item</button>
-      <CSSTransitionGroup
-        transitionName="example"
-        transitionEnterTimeout={500}
-        transitionLeaveTimeout={300}>
+      <TransitionGroup>
        {items}
-      </CSSTransitionGroup>
+      </TransitionGroup>
    </div>
  )
}
```

That doesn't get us much, since we haven't included anything to do the animation.
For that we wrap each item in a `CSSTransition`, but first let's adjust our css.

```diff
.example-enter {
  opacity: 0.01;
}

.example-enter.example-enter-active {
  opacity: 1;
  transition: opacity 500ms ease-in;
}

-.example-leave {
+.example-exit {
  opacity: 1;
}

-.example-leave.example-leave-active {
+.example-exit.example-exit-active {
  opacity: 0.01;
  transition: opacity 300ms ease-in;
}
```
All we did was replace the word `"leave"` with `"exit"`. Overall, `v2` uses
"exit" instead of "leave" to be more symmetrical, avoiding awkwardness
with english tenses (like "entered" and "leaved").

Now, at last we include the `CSSTransition` component.

```diff
render() {
  const items = this.state.items.map((item, i) => (
+    <CSSTransition
+      key={item}
+      classNames="example"
+      timeout={{ enter: 500, exit: 300 }}
+    >
      <div onClick={() => this.handleRemove(i)}>
        {item}
      </div>
+    <CSSTransition>
  ));

  return (
    <div>
      <button onClick={this.handleAdd}>Add Item</button>
      <TransitionGroup>
        {items}
      </TransitionGroup>
    </div>
  )
}
```

Notice that we replaced `transitionName` with `classNames`, it has essentially the same signature.
We also replaced `transitionEnterTimeout` and `transitionLeaveTimeout` with a single
`timeout` prop that accepts an object.

> Hint: If your enter and exit timeouts are the same you can use the shorthand: `timeout={500}`

If we wanted to make this a bit more encapsulated we could wrap up our `CSSTransition`
into a separate component for reuse later!

```js
const FadeTransition = (props) => (
  <CSSTransition
    {...props}
    classNames="example"
    timeout={{ enter: 500, exit: 300 }}
  />
)
```

And then use it like:

```diff
render() {
  const items = this.state.items.map((item, i) => (
-    <CSSTransition
-      key={item}
-      classNames="example"
-      timeout={{ enter: 500, exit: 300 }}
-    >
+    <FadeTransition>
      <div onClick={() => this.handleRemove(i)}>
        {item}
      </div>
-    <CSSTransition>
+    </FadeTransition>
  ));

  return (
    <div>
      <button onClick={this.handleAdd}>Add Item</button>
      <TransitionGroup>
        {items}
      </TransitionGroup>
    </div>
  )
}
```

> HEY! You may not need CSSTransition at all! The lower level `Transition` component
is very flexible and may be easier to work with for simpler or custom cases. Check out how we migrated react-bootstrap's simple transitions to v2: [https://github.com/react-bootstrap/react-bootstrap/pull/2676/files#diff-4f938f648d04d4859be417d6590ca7c4](Collapse) and [https://github.com/react-bootstrap/react-bootstrap/pull/2676/files#diff-8f766132cbd9f8de55ee05d63d75abd8](Fade)


### TransitionGroup

The old TransitionGroup managed transitions through custom static lifecycle methods
on its `children`. In `v2` we removed that API in favor of requiring that `TransitionGroup`s
be used with a `Transition` component, and traditional prop passing to communicate with the Group.

Practically this means that `TransitionGroup` will inject it's `children` with `Transition` specific
props that **must** be passed through to the `Transition` component in order for the
transition to work.

```js
const MyTransition = ({ children: child, ...props }) => (
  // NOTICE THE SPREAD! THIS IS REQUIRED!
  <Transition {...props}>
    {(transitionState) => React.cloneElement(child, {
      style: getStyleBasedOnTransitionState(transitionState)
    })}
  </Transition>
)

const MyList = () => (
  <TransitionGroup>
    {items.map((item) => (
      <MyTransition>{item}</MyTransition>
    )}
  </TransitionGroup>
);
```

Notice how `MyTransition` passes all props it doesn't care about to `Transition`?


#### Callbacks

As noted, child lifecycle methods have been removed. If you do need to do some work
when the Transition _changes_ from one state to another you can use the callback props.

```js
<Transition
  {...props}
  onEnter={handleEnter}
  onEntering={handleEntering}
  onEntered={handleEntered}
  onExit={handleExit}
  onExiting={handleExiting}
  onExited={handleExited}
/>
```

Each callback is called with the DOM `node` of the transition. Notice also that there
are now actually _3_ states per enter/exit transition vs the original 2.
See the documentation for more details.