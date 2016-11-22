interface IObserver{
    (...args:any[]): any;
    [propName: string]: any;
}