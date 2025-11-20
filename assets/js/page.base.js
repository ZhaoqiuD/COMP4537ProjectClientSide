export default class PageBase {
  constructor(rootId) {
    this.rootId = rootId;
  }

  get root() {
    return document.getElementById(this.rootId);
  }

  init() {
    // To be overridden by subclasses
  }

  mountEvents() {
    // To be overridden by subclasses
  }

  destroy() {
    // Optional cleanup
  }
}
// moved to client/
