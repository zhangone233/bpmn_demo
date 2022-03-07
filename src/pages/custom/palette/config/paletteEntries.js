// paletteEntries.js 的目的是返回一个包含工具数据的集合（对象或数组） 这里简单创建两个工具元素，开始和结束

import {
  assign
} from 'min-dash';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

const HIGH_PRIORITY = 1500,
      TASK_BORDER_RADIUS = 2;

export default {
  // 自定义panel
  'create.start-event': createAction(
    'bpmn:StartEvent',
    'event',
    'bpmn-icon-start-event-none',
    'Create StartEvent'
  ),
  'create.task2': createAction(
    'bpmn:Task',
    'activity2',
    // 'bpmn-icon-task',
    'bpmn-icon-task-2', // 🙋‍♂️ 使用图片后，记得修改成自己的类名
    'Create Task',
    require('../../../assets/imgs/task.png'), // 使用图片
    drawShape, //增加一个 drawShape 功能，也就是将创建 SVG 的工作交给 paletteEntries.js 实现
  ),

  // 自带的
  'create.task3': createAction(
    'bpmn:Task',
    'activity3',
    // 'bpmn-icon-task',
    'bpmn-icon-task-3', // 🙋‍♂️ 使用图片后，记得修改成自己的类名
    'Create Task',
    require('../../../assets/imgs/douyin_icon.png'), // 使用图片
    drawShape, //增加一个 drawShape 功能，也就是将创建 SVG 的工作交给 paletteEntries.js 实现
  ),
  'create.task4': createAction(
    'bpmn:Task',
    'activity4',
    // 'bpmn-icon-task',
    'bpmn-icon-task-4', // 🙋‍♂️ 使用图片后，记得修改成自己的类名
    'Create Task',
    require('../../../assets/imgs/douyin_icon.png'), // 使用图片
    drawShape, //增加一个 drawShape 功能，也就是将创建 SVG 的工作交给 paletteEntries.js 实现
  ),
}

function createAction(type, group, className, title, imageUrl = '', drawShape) {
  // 还记得 CustomPalette.js 吗？便是这里回调 createListener 函数
  // if (action === 'click') {
  // 		handler(originalEvent, autoActivate, elementFactory, create)
  // 	}
  function createListener(event, autoActivate, elementFactory, create) {
    var shape = elementFactory.createShape({ type })

    create.start(event, shape)
  }

  const config = {
    type, // 📌 渲染的时候需要判断
    group: group,
    className: className,
    title: title,
    // drawShape: drawShape, // 📌
    action: {
      dragstart: createListener,
      click: createListener
    }
  }
  if (imageUrl) {
    assign(config, {
      imageUrl, // 固定的属性名就叫 'imageUrl' 吗
    })
  }
  if (drawShape) {
    assign(config, {
      drawShape
    })
  }

  return config;
}

// 这里将 CustomRenderer.js 渲染的方法搬到 paletteEntries
function drawShape(parentNode, element, bpmnRenderer, shapeConfig) {
  const shape = bpmnRenderer.drawShape(parentNode, element)

  if (is(element, 'bpmn:Task')) {
    const height = 80
    const width = 100
    // 真实元素的宽高
    element.width = width
    element.height = height

    // // 显示元素的宽高与真实的宽高需要一致
    // const rect = drawRect(
    //   parentNode,
    //   width,
    //   height,
    //   TASK_BORDER_RADIUS,
    //   '#52B415'
    // )

    // prependTo(rect, parentNode)

    // svgRemove(shape)

    // return shape

    const customIcon = svgCreate('image', { // 在这里创建了一个image
      width,
      height,
      href: shapeConfig.imageUrl,
      transform: 'scale(0.8, 0.8)'
    })

    svgAppend(parentNode, customIcon)

    return customIcon
  }

  const rect = drawRect(parentNode, 30, 20, TASK_BORDER_RADIUS, '#cc0000')

  svgAttr(rect, {
    transform: 'translate(-20, -10)'
  })

  return shape
}

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, strokeColor) {
  const rect = svgCreate('rect');

  svgAttr(rect, {
    width: width,
    height: height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: strokeColor || '#000',
    strokeWidth: 2,
    fill: '#fff'
  });

  svgAppend(parentNode, rect);

  return rect;
}

// copied from https://github.com/bpmn-io/diagram-js/blob/master/lib/core/GraphicsFactory.js
function prependTo(newNode, parentNode, siblingNode) {
  parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild);
}