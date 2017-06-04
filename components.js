const h = (type, props = {}, children = []) => ({
  type,
  props,
  children
});

const ListHeadComponent = (list) => {
  let children = list.map(content => {
    return ListItemComponent(content);
  });
  return h('ul', { id: 'list' }, children);
}

const ListItemComponent = content => {
  return h('li', {}, [content]);
}

const RootComponent = (list) => {
  return h('div', {}, [ ListHeadComponent(list) ]);
}