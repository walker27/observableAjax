class Subject {
  constructor() {
    this.__value;
    this.observers = [];
  }
  addObserver(observer) {
    if (typeof observer !== 'function')
      return;
    this.observers.push(observer);
  }
  removeObserver(observer) {
    this.observers = this.observers.filter(function(obs) {
      return obs !== observer
    });
  }
  notify() {
    let
      args = arguments,
      arr = [];
    for (let i = 1, len = args.length; i < len; i++) {
      arr.push(args[i]);
    }
    for (let i = 0, len = this.observers.length; i < len; i++) {
      this.observers[i].apply(args[0], arr);
    }
  }
  eachObserver(callback) {
    for (let i = 0, len = this.observers.length; i < len; i++) {
      callback(this.observers[i], i);
    }
  }
}

module.exports = Subject;