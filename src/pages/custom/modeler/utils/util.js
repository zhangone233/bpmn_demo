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

export const BPMN_PUBLIC_STATE = {
  IS_CREATE: true, // 是否能创建图形
}