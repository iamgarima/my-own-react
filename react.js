const h = (type, props = {}, children = []) => ({
  type,
  props,
  children
});

const WelcomeComponent = ({ name }) => h('div', {}, [`Welcome ${name}!`]);

const RootComponent = ({ user }) => {
  if (user) {
    return h('div', {}, [`Welcome ${user.name}!`]);
  } else {
    return h('div', {}, ['Please, Log in.']);
  }
};

const createVDOM = (element, id = '.') => {
  const newElement = {
    type: element.type,
    props: element.props,
    id
  };
  if(!element.children) {
    newElement.children = [];
  } else {
    newElement.children = element.children.map((child, index) => {
      if (typeof child === 'object') {
        return createVDOM(child, `${id}${index}.`);
      } else {
        return child;
      }
    });
  }
  if (typeof element.type === 'function') {
    const subtree = newElement.type(element.props);
    if (subtree.memoized) {
      return subtree;
    } else {
      return createVDOM(subtree, id);
    }
  } else {
    return newElement;
  }
};

const memoize = component => {
  let lastProps = null;
  let lastResult = null;
  return props => {
    if (!shallowEqual(props, lastProps)) {
      lastResult = component(props);
      lastProps = props;
      lastResult.memoized = true;
    } else {
      lastResult.memoized = false;
    }
    return lastResult;
  };
};

const diff = (left, right, patches, parent = null) => {
  if (!left) {
    patches.push({
      parent,
      type: "PATCH_CREATE_NODE",
      node: right
    });
  } else if (!right) {
    patches.push({
      type: "PATCH_REMOVE_NODE",
      node: left
    });
  } else if (left.type !== right.type || left !== right) {
    patches.push({
      type: "PATCH_REPLACE_NODE",
      replacingNode: left,
      node: right
    });
  } else if (right.memoized) {
    return;
  } else {
    if (typeof left === 'string' || typeof right === 'string') {
      const children = left.children.length >= right.children.length ? left.children : right.children;
      children.forEach((child, index) => diff(
        left.children[index],
        right.children[index],
        patches,
        left
      ))
    }
  }
};

const ID_KEY = 'data-react-id';
const correlateVDOMNode = (vdomNode, domRoot) => {
  if (vdomNode === null) {
    return domRoot;
  } else {
    return document.querySelector(`[${ID_KEY}="${vdomNode.id}"]`);
  }
};

const createNodeRecursive = (vdomNode, domNode) => {
  if (typeof vdomNode === 'string') {
    domNode.innerHTML = vdomNode;
  } else {
    const domElement = document.createElement(vdomNode.type);
    domElement.setAttribute(ID_KEY, vdomNode.id);
    domNode.appendChild(domElement);
    vdomNode.children.forEach(child => createNodeRecursive(child, domElement));
  }
};

const applyPatch = (patch, domRoot) => {
  switch (patch.type) {
    case "PATCH_CREATE_NODE": {
      const domNode = correlateVDOMNode(patch.parent, domRoot);
      createNodeRecursive(patch.node, domNode);
    }
      break;
    case "PATCH_REMOVE_NODE": {
      const domNode = correlateVDOMNode(patch.node, domRoot);
      domNode.parentNode.removeChild(domNode);
    }
      break;
    case "PATCH_REPLACE_NODE": {
      const domNode = correlateVDOMNode(patch.replacingNode, domRoot);
      const parentDomNode = domNode.parentNode;
      parentDomNode.removeChild(domNode);
      createNodeRecursive(patch.node, parentDomNode);
    }
      break;
    default:
      throw new Error(`Missing implementation for patch ${patch.type}`);      
  }
};

const createRender = domElement => {
  let lastVDOM = null;
  let patches = null;
  return element => {
    const vdom = createVDOM(element);
    patches = [];
    diff(lastVDOM, vdom, patches);
    patches.forEach(patch => applyPatch(patch, domElement));
    lastVDOM = vdom;
  };
};

const render = createRender(document.getElementById('app'));

let loggedIn = false;
setInterval(() => {
  loggedIn = !loggedIn;
  render(h(RootComponent, {
    user: loggedIn ? { name: 'Garima' } : null
  }))
}, 1000);