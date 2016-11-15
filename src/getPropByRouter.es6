function getPropByRouter(targetObj, router) {
  if (router === 'this' || router === '')
    return targetObj;
  let
    props = router.split('.'),
    targetData = targetObj;

  while (props.length !== 0) {
    if (targetData instanceof Array) {
      arr = [];
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


module.exports = getPropByRouter;