/// <reference path="../typings/getPropByRouter.d.ts" />
function getPropByRouter(targetObj: any, router: string): any {
  if (router === 'this' || router === '')
    return targetObj;
  let
    props = router.split('.'),
    targetData = targetObj;

  while (props.length !== 0) {
    if (targetData instanceof Array) {
      let arr: any[] = [];
      for (let i = 0, len = targetData.length; i < len; i++) {
        arr.push(getPropByRouter(targetData[i], props.join('.')));
      }
      return arr;
    }
    targetData = targetObj[props.shift()];
    if (!targetData)
      break;
  }
  return targetData;
}


// module.exports = getPropByRouter;
export default getPropByRouter;