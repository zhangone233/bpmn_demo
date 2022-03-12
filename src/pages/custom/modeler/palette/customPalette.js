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

  function createTask() {
    return function (event) {
      const shape = elementFactory.createShape({
        type: "bpmn:Task",
      });
      console.log(shape); // 只在拖动或者点击时触发
      create.start(event, shape);
    };
  }

  return {
    "create.start-event": {
      group: "start",
      className: "bpmn-icon-start-event-none",
      title: "Create StartEvent",
      action: {
        dragstart: createTask(),
        click: createTask(),
      },
    },
    "create.task2": {
      group: "task2",
      className: "bpmn-icon-task-2",
      title: "Create Task",
      imageUrl: require("../../../assets/imgs/task.png"),
      action: {
        dragstart: createTask(),
        click: createTask(),
      },
    },

    // 自带的
    "create.task3": {
      group: "task3",
      className: "bpmn-icon-task-3",
      title: "Create Task",
      imageUrl: require("../../../assets/imgs/client.png"),
      action: {
        dragstart: createTask(),
        click: createTask(),
      },
    },
    "create.task4": {
      group: "task4",
      className: "bpmn-icon-task-4",
      title: "Create Task",
      imageUrl: require("../../../assets/imgs/FE.png"),
      action: {
        dragstart: createTask(),
        click: createTask(),
      },
    },
  };
};
