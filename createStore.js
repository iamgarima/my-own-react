const createStore = reducer => {
  let state = undefined;
  let subscribers = [];
  return {
    dispatch: (action) => {
      validateAction(action);
      state = reducer(state, action);
      subscribers.forEach(handle => handle(state));
    },
    subscribe: handle => {
      subscribers.push(handle);
      return (handle) => {
        subscribers.splice(subscribers.indexOf(handle), 1);
      };
    }
  }
};

const store = createStore(reducer);

const unsubscribe = store.subscribe(state => {
  render(RootComponent(state));
});