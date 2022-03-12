// /parts/TitleProps.js
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { entryConfig } from './entry';

let init = true;

export default function(group, element, translate) {
  if (is(element, 'bpmn:StartEvent')) { // 可以在这里做类型判断

    const { businessObject } = element;
    const $attrs = businessObject.$attrs;

    console.log(businessObject,'businessObject');
    console.log(businessObject.$attrs,'attrs');
    
    entryConfig.task.forEach(item => {
      const hiddenConfig = item.hiddenConfig;
      const hidden = hiddenConfig ? () => {
        return $attrs[hiddenConfig.dependField] === hiddenConfig.dependValue;
      }: undefined;

      const options = {
        ...item,
        hidden,
      }

      group.entries.push(entryFactory[item.type](translate, options));
    });


    // const selectBoxOptions = {
    //   id : 'select',
    //   description : '下拉框的描述',
    //   label : '下拉选择器',
    //   modelProperty : 'select',
    //   selectOptions: [
    //     {
    //       name: '1',
    //       value: '1', // value 类型为字符串，即使传数字也会被转为字符串
    //     },
    //     {
    //       name: '2',
    //       value: '2',
    //     },
    //   ],
    // };

    // const options = {
    //   id : 'inputField',
    //   description : '一个输入框',
    //   label : '请输入',
    //   modelProperty : 'inputField',
    //   hidden: () => {
    //     return $attrs.select === '2'; // 上面select选择value为2时，隐藏此输入框
    //   }
    // };

    // group.entries.push(entryFactory.selectBox(translate, selectBoxOptions));
    // group.entries.push(entryFactory.textField(translate, options));

  }
}
