/// <reference path="../typings/ObservableAjax.d.ts" />
import Subject from './subject';
import getPropByRouter from './getPropByRouter';
const
  _id = (a: any) => a,
  isFunction = (maybeFunc: any) => typeof(maybeFunc) === 'function',
  isNotFunction = (maybeFunc: any) => !isFunction(maybeFunc),
  noop = () => {},
  alwaysTrue: booleanFunc = () => true;

/**
 * 触发事件
 */
function _triggerEvent(ctx: ObservableAjax) {
  return function __triggerEvent(subjectEv: Subject, ...args: any[]) {
    subjectEv.notify.call(subjectEv, ctx, ...args);
  }
}
/**
 * 请求类型:
 */
enum EajaxType { 
  /**
   * 网络请求
   */
  Net = 519,
  /**
   * 从其他堆栈中获取
   */ 
  Trans 
};
/**
 * 事件类型
 */
enum FlowType {
    /**
     * 请求开始之前
     */
    updateStart = 519,
    /**
     * 请求结束并在全部通知完成之后
     */
    updateEnd,
    /**
     * 请求出错时，在updateEnd之前
     */
    updateFailed,
}
class ObservableAjax {
  private ajaxFunc: Function;
  public params:any = {};
  private paramSubject = new Subject();
  public ajaxResponse: any = {};
  private paramVerifier: booleanFunc = alwaysTrue;
  private responseTransformer: Function = _id;
  private resSubject = new Subject();
  private flowEvent = {
    [FlowType.updateStart]: new Subject(),
    [FlowType.updateEnd]: new Subject(),
    [FlowType.updateFailed]: new Subject(),
  }
  static ajaxType = EajaxType;
  static eventType = FlowType;
  constructor(ajaxFunc = noop) {
    this.ajaxFunc = ajaxFunc;
  }

  /**
   * 设置参数校验器
   */
  setParamVerifier(verifier: booleanFunc) {
    if(isNotFunction(verifier))
      return;
    this.paramVerifier = verifier;
    return this;
  }

  /**
   * 设置ajax返回内容转换器
   */
  setResponseTransformer(transformer: Function) {
    if (isNotFunction(transformer))
      return;
    this.responseTransformer = transformer;
    return this;
  }

  /**
   * 为流程事件增加观察者
   */
  addEventListener(eventName: FlowType, callback: IObserver) {
    if (isNotFunction(callback) || !this.flowEvent[eventName])
      return this;
    this.flowEvent[eventName].addObserver(callback);
    return this;
  }

  /**
   * 为流程事件移除观察者
   */
  removeEventListener(eventName: FlowType, callback: IObserver) {
    if (isNotFunction(callback) || !this.flowEvent[eventName])
      return this;
    this.flowEvent[eventName].removeObserver(callback);
    return this;
  }

  /**
   * 订阅返回的内容
   */
  subscribe(router: string, callback: IObserver) {
    if (isNotFunction(callback))
      return this;
    callback['__router'] = router;
    this.resSubject.addObserver(callback);
    return this;
  }

  /**
   * 取消订阅返回的内容
   */
  unsubscribe(callback: IObserver) {
    this.resSubject.removeObserver(callback);
    return this;
  }

  /**
   * 添加参数收集器
   * 将当前的ajax请求参数params传递给观察者,以供修改
   */
  addParamCollector(callback: IObserver) {
    if (isNotFunction(callback))
      return this;
    this.paramSubject.addObserver(callback);
    return this;
  }

  /**
   * 移除参数收集器
   */
  removeParamCollector(callback: IObserver) {
    this.paramSubject.removeObserver(callback);
    return this;
  }

  /**
   * 执行请求流程
   */
  update(option: IOAoption) {
    const
      self = this,
      opt = typeof option === 'object' ? option : {},
      temporaryParam = opt.params || {},
      ajaxType = ObservableAjax.ajaxType,
      reqType = opt.type || ajaxType.Net,
      triggerEvent = _triggerEvent(self),

      extendsArgs = opt.extendArgs instanceof Array ? opt.extendArgs : [];
    // 收集参数
    self.paramSubject.notify(self, self.params);
    // 并入本次请求的参数
    for (let key in temporaryParam) {
      self.params[key] = temporaryParam[key];
    }
    // 验证参数是否有效, 若无效则停止流程
    if (self.paramVerifier(self.params) === false)
      return;

    // update前, 可在此时调整参数, 或处理通用行为
    triggerEvent(self.flowEvent[FlowType.updateStart], self.params)
    if (reqType === ajaxType.Net) {
      self.ajaxFunc.apply(null, [self.params, successCb, errorCb].concat(extendsArgs));
    } else {
      transData();
    }

    function successCb(resObj: any, params ?: any) {
      self.ajaxResponse = resObj;
      let transformedData = self.responseTransformer(resObj, params);
      if (transformedData) {
        self.resSubject.eachObserver(function(observer, idx) {
          observer(getPropByRouter(transformedData, observer['__router']), self.params);
        });
      }

      triggerEvent(self.flowEvent[FlowType.updateEnd], transformedData, self.params);
    }

    function errorCb(e: any) {
      triggerEvent(self.flowEvent[FlowType.updateFailed], e);
      triggerEvent(self.flowEvent[FlowType.updateEnd]);
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