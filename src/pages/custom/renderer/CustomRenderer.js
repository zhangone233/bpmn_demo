import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  find,
} from 'min-dash';
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  getRoundRectPath
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

const HIGH_PRIORITY = 1500,
      TASK_BORDER_RADIUS = 2;



export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer, paletteEntries) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;
    this.paletteEntries = paletteEntries; // custom ..
  }

  canRender(element) {

    // only render tasks and events (ignore labels)
    return isAny(element, [ 'bpmn:Task', 'bpmn:Event' ]) && !element.labelTarget;
  }

  //  CustomRenderer.js 的 drawShape() 方法，这个是渲染的核心方法， 返回一个 shape，即一个 SVG
  drawShape(parentNode, element) {
    const paletteEntries = this.paletteEntries
    // 通过 type 找到对应的配置
    const shape = find(paletteEntries, (entry) => {
      console.log(element,'element');
      return is(element, entry.type)
    })
    // 如果传入自定义方法，则回调该方法
    if (shape && shape.drawShape instanceof Function) {
      return shape.drawShape(parentNode, element, this.bpmnRenderer, shape)
    }
    // 否则调用默认渲染的方法
    return this.bpmnRenderer.drawShape(parentNode, element)
  }

  getShapePath(shape) {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }
}

CustomRenderer.$inject = [ 'eventBus', 'bpmnRenderer', 'config.paletteEntries' ]; // new Bpmn() 时传入的config配置对象


// helpers //////////

// // copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
// function drawRect(parentNode, width, height, borderRadius, strokeColor) {
//   const rect = svgCreate('rect');

//   svgAttr(rect, {
//     width: width,
//     height: height,
//     rx: borderRadius,
//     ry: borderRadius,
//     stroke: strokeColor || '#000',
//     strokeWidth: 2,
//     fill: '#fff'
//   });

//   svgAppend(parentNode, rect);

//   return rect;
// }

// // copied from https://github.com/bpmn-io/diagram-js/blob/master/lib/core/GraphicsFactory.js
// function prependTo(newNode, parentNode, siblingNode) {
//   parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild);
// }