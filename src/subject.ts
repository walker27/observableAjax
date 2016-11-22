/// <reference path="../typings/subject.d.ts" />
class Subject{
  __value: any;
  observers: Array<IObserver>;
  // addObserver: (observer: ()=>void) => void;
  constructor() {
    this.__value;
    this.observers = [];
  }
  addObserver(observer: IObserver) {
    if (typeof observer !== 'function')
      return;
    this.observers.push(observer);
  }
  removeObserver(observer: IObserver) {
    this.observers = this.observers.filter(function(obs) {
      return obs !== observer
    });
  }
  notify(ctx: any, ...args: any[]) {
    // let
    //   args = arguments,
    //   arr:any[] = [];
    // for (let i = 1, len = args.length; i < len; i++) {
    //   arr.push(args[i]);
    // }
    for (let i = 0, len = this.observers.length; i < len; i++) {
      this.observers[i].apply(ctx, args);
    }
  }
  eachObserver(callback: (observer: IObserver, idx:number) => void) {
    for (let i = 0, len = this.observers.length; i < len; i++) {
      callback(this.observers[i], i);
    }
  }
}

// module.exports = Subject;
export default Subject;