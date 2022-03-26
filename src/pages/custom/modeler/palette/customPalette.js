import { customTask } from '../utils/util'

const entriesConfig = {};

for (let id in customTask) {
    const taskInfo = customTask[id];

    entriesConfig[`create.${id}`] = createAction(
        'bpmn:Task', // 都创建 <bpmn:Task /> xml标签图形
        'event', // 图形分组的名称
        'bpmn-icon-task-custom', // 类名，内置不要随便改。这里是使用了自定义图片 (可以多加几个自定义类名)
        taskInfo.label, // label
        taskInfo.imgUrl, // 图片
        id, // 图形 id (前缀：id_随机时间戳)
    );
}

function createAction(type, group, className, title, imageUrl, id) {
  
  function createListener(event, autoActivate, elementFactory, create) {
      console.log(imageUrl,'imageUrl');
      var shape = elementFactory.createShape({ type, id: `${id}_${Date.now()}` })

      create.start(event, shape)
  }

  return {
      group: group,
      className: className,
      title: title,
      imageUrl, // 📌
      action: {
          dragstart: createListener,
          click: createListener
      }
  }
}

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */
export default function PaletteProvider(palette, create, elementFactory, globalConnect) {
  this.create = create;
  this.elementFactory = elementFactory;
  this.globalConnect = globalConnect;

  palette.registerProvider(this);
}

PaletteProvider.$inject = ["palette", "create", "elementFactory", "globalConnect"];

PaletteProvider.prototype.getPaletteEntries = function (element) {
  // 此方法和上面案例的一样
  const { create, elementFactory } = this;

  // function createTask() {
  //   return function (event) {
  //     const shape = elementFactory.createShape({
  //       type: "bpmn:Task",
  //     });
  //     console.log(shape); // 只在拖动或者点击时触发
  //     create.start(event, shape);
  //   };
  // }

  return entriesConfig;


  // return {
  //   "create.start-event": {
  //     group: "start",
  //     className: "bpmn-icon-start-event-none",
  //     title: "Create StartEvent",
  //     action: {
  //       dragstart: createTask(),
  //       click: createTask(),
  //     },
  //   },
  //   "create.task2": {
  //     group: "task2",
  //     className: "bpmn-icon-task-2",
  //     title: "Create Task",
  //     imageUrl: require("../../../assets/imgs/task.png"),
  //     action: {
  //       dragstart: createTask(),
  //       click: createTask(),
  //     },
  //   },

  //   // 自带的
  //   "create.task3": {
  //     group: "task3",
  //     className: "bpmn-icon-task-3",
  //     title: "Create Task",
  //     imageUrl: require("../../../assets/imgs/client.png"),
  //     action: {
  //       dragstart: createTask(),
  //       click: createTask(),
  //     },
  //   },
  //   "create.task4": {
  //     group: "task4",
  //     className: "bpmn-icon-task-4",
  //     title: "Create Task",
  //     imageUrl: require("../../../assets/imgs/FE.png"),
  //     action: {
  //       dragstart: createTask(),
  //       click: createTask(),
  //     },
  //   },
  // };
};
