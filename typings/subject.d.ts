interface IObserver{
    (...args:any[]): any;
    [propName: string]: any;
}

interface ISubject{
    __value: any;
    observers: any[];
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
    notify(ctx: any, ...args: any[]): void;
    eachObserver(callback: (observer: IObserver, idx:number) => void): void;
}