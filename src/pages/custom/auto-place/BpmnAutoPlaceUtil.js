
import { is, isAny } from './ModelUtil';

import {
  getMid,
  asTRBL,
  getOrientation
} from 'diagram-js/lib/layout/LayoutUtil';

import {
  findFreePosition,
  generateGetNextPosition,
  getConnectedDistance
} from 'diagram-js/lib/features/auto-place/AutoPlaceUtil';

import { customStart } from './one';

/**
 * Find the new position for the target element to
 * connect to source.
 *
 * @param  {djs.model.Shape} source
 * @param  {djs.model.Shape} element
 *
 * @return {Point}
 */
export function getNewShapePosition(source, element, elementRegistry, modeling) {
  console.log(element,'element');

  if (is(element, 'bpmn:TextAnnotation')) {

    return getTextAnnotationPosition(source, element);
  }

  if (isAny(element, [ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])) {
    return getDataElementPosition(source, element);
  }

  if (is(element, 'bpmn:FlowNode')) {

    return getFlowNodePosition(source, element, elementRegistry, modeling);
  }
}

/**
 * Always try to place element right of source;
 * compute actual distance from previous nodes in flow.
 */
export function getFlowNodePosition(source, element, elementRegistry, modeling) {

  var sourceTrbl = asTRBL(source);
  var sourceMid = getMid(source);

  var horizontalDistance = getConnectedDistance(source, {
    filter: function(connection) {
      return is(connection, 'bpmn:SequenceFlow');
    }
  });

  var margin = 30,
      minDistance = 80,
      orientation = 'left';

  if (is(source, 'bpmn:BoundaryEvent')) {
    orientation = getOrientation(source, source.host, -25);

    if (orientation.indexOf('top') !== -1) {
      margin *= -1;
    }
  }

  var position = {
    x: sourceTrbl.right + horizontalDistance + element.width / 2,
    y: sourceMid.y + getVerticalDistance(orientation, minDistance)
  };

  var nextPositionDirection = {
    y: {
      margin: margin,
      minDistance: minDistance
    }
  };

  // nextPosition 为 autoPlace 插件自动计算出来的最终位置信息 （算出来的是中心点）
  const nextPosition = findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));

  // 通过中心点与宽高计算，得到左上角坐标.
  const lastPosition = {
    x: nextPosition.x - source.width / 2,
    y: nextPosition.y - source.height / 2,
  }

  // 自定义计算
  const latestPosition = customStart({
    source,
    element,
    modeling,
    lastPosition,
    elementRegistry,
  });

  // 再得回中心点
  const resultPosition = {
    x: latestPosition.x + source.width / 2,
    y: latestPosition.y + source.height / 2,
  }

  return resultPosition;
}


function getVerticalDistance(orientation, minDistance) {
  if (orientation.indexOf('top') != -1) {
    return -1 * minDistance;
  } else if (orientation.indexOf('bottom') != -1) {
    return minDistance;
  } else {
    return 0;
  }
}


/**
 * Always try to place text annotations top right of source.
 */
export function getTextAnnotationPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var position = {
    x: sourceTrbl.right + element.width / 2,
    y: sourceTrbl.top - 50 - element.height / 2
  };

  if (isConnection(source)) {
    position = getMid(source);
    position.x += 100;
    position.y -= 50;
  }

  var nextPositionDirection = {
    y: {
      margin: -30,
      minDistance: 20
    }
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}


/**
 * Always put element bottom right of source.
 */
export function getDataElementPosition(source, element) {

  var sourceTrbl = asTRBL(source);

  var position = {
    x: sourceTrbl.right - 10 + element.width / 2,
    y: sourceTrbl.bottom + 40 + element.width / 2
  };

  var nextPositionDirection = {
    x: {
      margin: 30,
      minDistance: 30
    }
  };

  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}

// 判断一个图形元素是否是连接线
function isConnection(element) {
  return !!element.waypoints;  // waypoints 是连接线元素才会有的线条弯曲交叉点坐标属性
}