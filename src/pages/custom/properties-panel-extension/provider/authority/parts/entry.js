export const entryConfig = {
  task: [
    {
      id : 'select',
      description : '下拉框的描述',
      label : '下拉选择器',
      modelProperty : 'select',
      type: 'selectBox', // 选择器
      selectOptions: [
        {
          name: '1',
          value: '1', // value 类型为字符串，即使传数字也会被转为字符串
        },
        {
          name: '2',
          value: '2',
        },
      ],
    },
    {
      id : 'inputField',
      description : '一个输入框',
      label : '请输入',
      modelProperty : 'inputField',
      type: 'textField',
      hiddenConfig: {
        dependField: 'select', // 显隐关联的其它字段的名字
        dependValue: '2', // 上面select选择value为2时，隐藏此输入框
      }
    }
  ],
}