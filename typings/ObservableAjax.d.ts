/// <reference path="./subject.d.ts" />

// interface IEnumFlowType {
//     updateStart: 'updateStart'; 
//     updateEnd: 'updateEnd';
//     updateFailed: 'updateFailed';
// }

// interface IflowEvent{
//     updateStart: ISubject;
//     updateEnd: ISubject;
//     updateFailed: ISubject;
//     [propName: string]: any;
// }
interface booleanFunc{
    (...args: any[]): boolean;
}

interface IOAoption{
    /**
     * 在EajaxType.Trans模式下, 延迟毫秒数， 若为0, 则马上执行(与setTimeout(,0)逻辑不同)
     */
    delay?: number;
    /**
     * 在EajaxType.Trans模式下，作为请求结果推送给观察者
     */
    resData?: any;
    /**
     * 请求参数
     */
    params?: any;
    /**
     * 请求类型EajaxType
     */
    type?: any;
    /**
     * 送入ajaxFunc的扩展参数
     */
    extendArgs?: any[];
}