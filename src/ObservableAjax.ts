import Subject from './subject';
import getPropByRouter from './getPropByRouter';
const
  _id = (a: any) => a,
  isFunction = (maybeFunc: any) => typeof(maybeFunc) === 'function',
  isNotFunction = (maybeFunc: any) => !isFunction(maybeFunc),
  noop = () => {},
  alwaysTrue = () => true;

/**
 * 触发事件
 */
function _triggerEvent(ctx: ObservableAjax) {
  return function __triggerEvent(eventName: string, ...args: any[]) {
    const subjectEv = ctx._flowEvent[eventName];
    subjectEv.notify.call(subjectEv, ctx, ...args);
  }
}
enum EajaxType { Net, Trans };
class ObservableAjax {
  // test = new Subject();
  _ajaxFunc: Function;
  params: any;
  _paramVerifier: Function;
  ajaxResponse: Object;
  _responseTransformer: Function;
  _resSubject: Subject;
  _paramSubject: Subject;
  _flowEvent: any;
  private flowEvent={
    updateStart: new Subject(),
    updateEnd: new Subject(),
    updateFailed: new Subject(),
  }
  // static ajaxType: any;
  static ajaxType = EajaxType;
  constructor(ajaxFunc = noop) {
    const self = this;
    self._ajaxFunc = ajaxFunc;
    self.params = {};
    self._paramVerifier = alwaysTrue;
    self._paramSubject = new Subject();
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
   * 设置参数校验器
   */
  setParamVerifier(verifier: Function) {
    if(isNotFunction(verifier))
      return;
    this._paramVerifier = verifier;
    return this;
  }

  /**
   * 设置ajax返回内容转换器
   */
  setResponseTransformer(transformer: Function) {
    if (isNotFunction(transformer))
      return;
    this._responseTransformer = transformer;
    return this;
  }

  /**
   * 为流程事件增加观察者
   */
  addEventListener(eventName: string, callback: IObserver) {
    if (isNotFunction(callback) || !this._flowEvent[eventName])
      return this;
    this._flowEvent[eventName].addObserver(callback);
    return this;
  }

  /**
   * 为流程事件移除观察者
   */
  removeEventListener(eventName: string, callback: IObserver) {
    if (isNotFunction(callback) || !this._flowEvent[eventName])
      return this;
    this._flowEvent[eventName].removeObserver(callback);
    return this;
  }

  /**
   * 订阅返回的内容
   */
  subscribe(router: string, callback: IObserver) {
    if (isNotFunction(callback))
      return this;
    callback['__router'] = router;
    this._resSubject.addObserver(callback);
    return this;
  }

  /**
   * 取消订阅返回的内容
   */
  unsubscribe(callback: IObserver) {
    this._resSubject.removeObserver(callback);
    return this;
  }

  /**
   * 添加参数收集器
   * 将当前的ajax请求参数params传递给观察者,以供修改
   * @param {Function} callback 观察者
   */
  addParamCollector(callback: IObserver) {
    if (isNotFunction(callback))
      return this;
    this._paramSubject.addObserver(callback);
    return this;
  }

  /**
   * 移除参数收集器
   */
  removeParamCollector(callback: IObserver) {
    this._paramSubject.removeObserver(callback);
    return this;
  }

  /**
   * 执行请求流程
   */
  update(option: any) {
    const
      self = this,
      opt = typeof option === 'object' ? option : {},
      temporaryParam = opt.params || {},
      ajaxType = ObservableAjax.ajaxType,
      reqType = opt.type || ajaxType.Net,
      triggerEvent = _triggerEvent(self),

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
    if (reqType === ajaxType.Net) {
      self._ajaxFunc.apply(null, [self.params, successCb, errorCb].concat(extendsArgs));
    } else {
      transData();
    }

    function successCb(resObj: any, params ?: any) {
      self.ajaxResponse = resObj;
      let transformedData = self._responseTransformer(resObj, params);
      if (transformedData) {
        self._resSubject.eachObserver(function(observer, idx) {
          observer(getPropByRouter(transformedData, observer['__router']), self.params);
        });
      }

      triggerEvent('updateEnd', transformedData, self.params);
    }

    function errorCb(e: any) {
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

export default ObservableAjax;