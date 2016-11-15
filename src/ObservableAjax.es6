const
  Subject = require('./subject.es6'),
  getPropByRouter = require('./getPropByRouter.es6'),
  _id = a => a,
  noop = () => {},
  alwaysTrue = () => true;

/**
 * 触发事件
 * @param  {string}    eventName 自定义的事件
 * @param  {...[type]} args      剩余参数作为广播给观察者的参数
 */
function _triggerEvent(ctx) {
  return function __triggerEvent(eventName, ...args) {
    const subjectEv = ctx._flowEvent[eventName];
    subjectEv.notify.call(subjectEv, ctx, ...args);
  }
}

class ObservableAjax {
  constructor(ajaxFunc = noop) {
    const self = this;
    self._ajaxFunc = ajaxFunc;
    self.params = {};
    self._paramVerifier = alwaysTrue;
    self.ajaxResponse = {};
    self._responseTransformer = _id;
    self._resSubject = new Subject();
    self._flowEvent = {
      'updateStart': new Subject(),
      'updateEnd': new Subject(),
      'updateFailed': new Subject(),
    };
  }

  /**
   * 触发事件
   * @param  {string}    eventName 自定义的事件
   * @param  {...[type]} args      剩余参数作为广播给观察者的参数
   */
  // _triggerEvent(eventName, ...args) {
  //   const subjectEv = this._flowEvent[eventName];
  //   subjectEv.notify.call(subjectEv, this, ...args);
  // }

  /**
   * 设置参数校验器
   * @param {Function} verifier 可以接收一个参数的方法, 校验参数内容，并返回true/false作为结果
   */
  setParamVerifier(verifier) {
    if (typeof verifier !== 'function')
      return;
    this._paramVerifier = verifier;
    return this;
  }

  /**
   * 设置ajax返回内容转换器
   * @param {Function} transformer 可以接收两个参数的方法, 第一参数会ajax返回的内容, 第二个为ajax的请求参数, 该方法返回的内容会作为推送给观察者的内容
   */
  setResponseTransformer(transformer) {
    if (typeof transformer !== 'function')
      return;
    this._responseTransformer = transformer;
    return this;
  }

  /**
   * 为流程事件增加观察者
   * @param {string}   eventName event name
   * @param {Function} callback  event Observer
   * @return {Object}            ajaxObservable实例本身
   */
  addEventListener(eventName, callback) {
    if (typeof callback !== 'function' || !this._flowEvent[eventName])
      return this;
    this._flowEvent[eventName].addObserver(callback);
    return this;
  }

  /**
   * 为流程事件移除观察者
   * @param {string}   eventName event name
   * @param {Function} callback  event Observer
   * @return {Object}            ajaxObservable实例本身
   */
  removeEventListener(eventName, callback) {
    if (typeof callback !== 'function' || !this._flowEvent[eventName])
      return this;
    this._flowEvent[eventName].removeObserver(callback);
    return this;
  }

  /**
   * 订阅返回的内容
   * @param  {string}   router   返回内容的路由
   * @param  {Function} callback 观察者
   * @return {Object}            ajaxObservable实例本身
   */
  subscribe(router, callback) {
    if (typeof callback !== 'function')
      return this;
    callback.__router = router;
    this._resSubject.addObserver(callback);
    return this;
  }

  /**
   * 取消订阅返回的内容
   * @param  {string}   router   返回内容的路由
   * @param  {Function} callback 观察者
   * @return {Object}            ajaxObservable实例本身
   */
  unsubscribe(callback) {
    this._resSubject.removeObserver(callback);
    return this;
  }

  /**
   * 添加参数收集器
   * 将当前的ajax请求参数params传递给观察者,以供修改
   * @param {Function} callback 观察者
   */
  addParamCollector(callback) {
    if (typeof callback !== 'function')
      return this;
    this._paramSubject.addObserver(callback);
    return this;
  }

  /**
   * 移除参数收集器
   * @param  {Function} callback [description]
   * @return {Object}            ajaxObservable实例本身
   */
  removeParamCollector(callback) {
    this._paramSubject.removeObserver(callback);
    return this;
  }

  /**
   * 执行请求流程
   * @param  {[type]} option [description]
   * @return {[type]}        [description]
   */
  update(option) {
    const
      self = this,
      opt = typeof option === 'object' ? option : {},
      temporaryParam = opt.params || {},
      ajaxType = AjaxObservable.ajaxType,
      reqType = opt.type || ajaxType.net,
      triggerEvent = _triggerEvent(self);

      extendsArgs = opt.extendArgs instanceof Array ? opt.extendArgs : [];
    // 收集参数
    self._paramSubject.notify(self, self.params);
    // 并入本次请求的参数
    for (let key in temporaryParam) {
      self.params[key] = temporaryParam[key];
    }
    // 验证参数是否有效, 若无效则停止流程
    if (self._paramVerifier(self.params) === false)
      return;

    // update前, 可在此时调整参数, 或处理通用行为
    triggerEvent('updateStart', self.params)
    if (reqType === ajaxType.net) {
      self._ajaxFunc.apply(null, [self.params, successCb, errorCb].concat(extendsArgs));
    } else {
      transData();
    }

    function successCb(resObj) {
      self.ajaxResponse = resObj;
      let transformedData = self._responseTransformer(resObj, self.params);
      if (transformedData) {
        self._resSubject.eachObserver(function(observer, idx) {
          observer(getPropByRouter(transformedData, observer.__router), self.params);
        });
      }

      triggerEvent('updateEnd', transformedData, self.params);
    }

    function errorCb(e) {
      triggerEvent('updateFailed', e);
      triggerEvent('updateEnd');
    }

    function transData() {
      const timeout = opt.delay;
      if (timeout === 0 || timeout) {
        setTimeout(function() { successCb(opt.resData, self.params); }, timeout);
        return;
      }
      successCb(opt.resData, self.params);
    }
    return this;
  };
}

ObservableAjax.ajaxType = {
  net: 'net',
  trans: 'transmission',
};


module.exports = ObservableAjax;