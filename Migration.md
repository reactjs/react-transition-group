# Migration Guide from v1 to v2

_A few notes to help with migrating from v1 to v2._

The `<CSSTransitionGroup>` component has been removed. A `<CSSTransition>` component has been added for use with the new `<TransitionGroup>` component to accomplish the same tasks.

### tl;dr:

- `transitionName` -> `classNames`
- `transitionEnterTimeout` and `transitionLeaveTimeout` -> `timeout={{ exit, enter }}`
- `transitionAppear` -> `appear`
- `transitionEnter` -> `enter`
- `transitionLeave` -> `exit`

## Walkthrough

Let's take the [original docs example](https://github.com/reactjs/react-transition-group/tree/v1-stable/#high-level-api-csstransitiongroup) and migrate it.

Starting with this CSS:

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

And this component:

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
      <div key={i} onClick={() => this.handleRemove(i)}>
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

The most straightforward way to migrate is to use `<TransitionGroup>` instead of `<CSSTransitionGroup>`:

```diff
 render() {
   const items = this.state.items.map((item, i) => (
     <div key={i} onClick={() => this.handleRemove(i)}>
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

That doesn't get us much, since we haven't included anything to do the animation. For that, we'll need to wrap each item in a `<CSSTransition>`. First, though, let's adjust our CSS:

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

All we did was replace `leave` with `exit`. v2 uses "exit" instead of "leave" to be more symmetric, avoiding awkwardness with English tenses (like with "entered" and "leaved").

Now we add the `<CSSTransition>` component:

```diff
 render() {
   const items = this.state.items.map((item, i) => (
+    <CSSTransition
+      key={i}
+      classNames="example"
+      timeout={{ enter: 500, exit: 300 }}
+    >
       <div onClick={() => this.handleRemove(i)}>
         {item}
       </div>
+    </CSSTransition>
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

Note that we replaced `transitionName` with `classNames`. `<CSSTransition>` otherwise has essentially the same signature as `<CSSTransitionGroup>`. We also replaced `transitionEnterTimeout` and `transitionLeaveTimeout` with a single `timeout` prop with an object.

> **Hint:** If your enter and exit timeouts are the same you can use the shorthand `timeout={500}`.

If we want to make this a bit more encapsulated, we can wrap our `<CSSTransition>` into a separate component for reuse later:

```js
const FadeTransition = (props) => (
  <CSSTransition
    {...props}
    classNames="example"
    timeout={{ enter: 500, exit: 300 }}
  />
);
```

We can then use it like:

```diff
 render() {
   const items = this.state.items.map((item, i) => (
-    <CSSTransition
-      key={i}
-      classNames="example"
-      timeout={{ enter: 500, exit: 300 }}
-    >
+    <FadeTransition key={i}>
       <div onClick={() => this.handleRemove(i)}>
         {item}
       </div>
-    </CSSTransition>
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

> **Hey!** You may not need `<CSSTransition>` at all! The lower level `<Transition>` component is very flexible and may be easier to work with for simpler or more custom cases. Check out how we migrated [React-Bootstrap](https://react-bootstrap.github.io/)'s simple transitions to v2 for the [`<Collapse>`](https://github.com/react-bootstrap/react-bootstrap/pull/2676/files#diff-4f938f648d04d4859be417d6590ca7c4) and [`<Fade>`](https://github.com/react-bootstrap/react-bootstrap/pull/2676/files#diff-8f766132cbd9f8de55ee05d63d75abd8) components.


## Wrapping `<Transition>` Components

The old `<TransitionGroup>` component managed transitions through custom static lifecycle methods on its children. In v2 we removed that API in favor of requiring that `<TransitionGroup>` be used with a `<Transition>` component, and using traditional prop passing to communicate between the two.

This means that `<TransitionGroup>`s inject their children with `<Transition>`-specific props that _must_ be passed through to the `<Transition>` component for the transition to work.

```js
const MyTransition = ({ children: child, ...props }) => (
  // NOTICE THE SPREAD! THIS IS REQUIRED!
  <Transition {...props}>
    {transitionState => React.cloneElement(child, {
      style: getStyleForTransitionState(transitionState)
    })}
  </Transition>
);

const MyList = () => (
  <TransitionGroup>
    {items.map(item => (
      <MyTransition>{item}</MyTransition>
    )}
  </TransitionGroup>
);
```

Note how `<MyTransition>` passes all props other than its own to `<Transition>`.


## Lifecycle Callbacks

As noted, child lifecycle methods have been removed. If you do need to do some work when the `<Transition>` changes from one state to another, use the lifecycle callback props.

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

Each callback is called with the DOM node of the transition component. Note also that there are now _three_ states per enter/exit transition instead of the original two. See the [full documentation](https://reactcommunity.org/react-transition-group/#Transition) for more details.
