class Node {
  constructor(id, fn) {
    this.id = id;
    this.parent = null;
    this.children = [];
    this.fn = fn;
    this.context = "session";
  }

  setContext(context) {
    this.context = context;
    this.children.map((node) => {
      if (node) {
        node.setContext(context);
      }
    });
  }

  label(arg) {
    return this.fn(arg);
  }

  hasChildren() {
    return this.children.length !== 0;
  }

  hasChild(id) {
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].id === id) {
        return true;
      }
    }
    return false;
  }
}

module.exports = {
  Node,
};
