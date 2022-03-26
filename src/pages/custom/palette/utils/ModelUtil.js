import {
  some
} from 'min-dash';


/**
 * Is an element of the given BPMN type?
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @param  {string} type
 *
 * @return {boolean}
 */
export function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}


/**
 * Return true if element has any of the given types.
 *
 * @param {djs.model.Base} element
 * @param {Array<string>} types
 *
 * @return {boolean}
 */
export function isAny(element, types) {
  return some(types, function(t) {
    return is(element, t);
  });
}

/**
 * Return the business object for a given element.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @return {ModdleElement}
 */
export function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

/**
 * Return the di object for a given element.
 *
 * @param  {djs.model.Base} element
 *
 * @return {ModdleElement}
 */
export function getDi(element) {
  return element && element.di;
}


/**
 * 左边工具栏的配置
 * personTask ：工具栏属性名与自定义属性面板的form组件保持一致
 */
 export const customTask = {
  "personTask" : {
    label: '用户事件',
    imgUrl: require('./../../../assets/imgs/RD.png'),
    // other property
  },
  "timerTask": {
    label: '时间器事件',
    imgUrl: require('./../../../assets/imgs/task.png'),
    // other property
  }
}


/** 
 * old
 */
// export const customTask = {
//   "personTask" : [
//     {
//       label: '用户事件',
//       imgUrl: require('./components/img/task.png'),
//       // other property
//     },
//     {
//       type: 'selectBox',      // 这些自定义bpmn自带属性面板的字段配置就不用了。 需要填写的字段都在form组件里写死的。 根据选中的工具栏图形展示到对应的表单即可
//       id: 'xxx',
//       selectOption: [
//         // xxx
//       ]
//     }
//   ],
// }

