
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

// 往下挪动
const outerShapeMove = (source, shapeLowest, outerShapeMoveY, allShape, modeling) => {
  // 获取最低位图形所有的连接线节点
  const incoming = shapeLowest?.incoming;
  if(!incoming?.length){
    return;
  }

  // 判断新建图形的父级点是否也是最地位图形的父级点（准确来说是连接点，目前并没有限制一个元素只能连接一个）。
  // 如果也是父级连接点，那么就不需要往下挪动了。
  const isUndesiredMove = incoming.some(connection => connection.source === source);
  if(isUndesiredMove){
    return;
  }

  // 如果最低位图形的位置在source父级图形之上，那么也无需下移
  if((shapeLowest.y + shapeLowest.height) < source.y){
    return;
  }

  // 父节点右上角坐标点
  const parentRightX = source.x + source.width;
  const parentRightY = source.y;

  // 以父节点右上角为点，90°直角系为范畴。 
  // 凡是其它元素的四角坐标其中一个轴有小于这个90°直角坐标点的话，
  // 都视为需要下移的对象

  const needMoveShapeList = allShape.filter(shape => {
    const { x: shapeX, y: shapeY, width, height } = shape;

    const leftUp = {
      x: shapeX,
      y: shapeY,
    };
    const leftDown = {
      x: shapeX,
      y: shapeY + height,
    };
    const rightUp = {
      x: shapeX + width,
      y: shapeY,
    };
    const rightDown = {
      x: shapeX + width,
      y: shapeY + height,
    };

    // 四个角坐标有一个处于直角系范围之内的，都往下调整位置
    return [leftUp,leftDown,rightUp,rightDown].some(({ x, y }) => {
      return (x <= parentRightX) && (y >= parentRightY);
    });
  });
  console.log(needMoveShapeList,'needMoveShapeList');

  modeling.moveElements(needMoveShapeList, {
    x: 0,
    y: outerShapeMoveY,
  });

}

// 自定义的方法
export function customGetCoordinate (lastPosition, elementRegistry, modeling, source, element) {
  const allShape = elementRegistry.getAll()[0].children || []; // 获取流程所有图形shape对象
  // console.log(allShape, 'shape');

  // 中心坐标
  const { x, y } = lastPosition;

  // 先拿到实际运算用的位置 （左上角坐标）
  const offsetX = x - element.width / 2;
  const offsetY = y - element.height / 2;
  
  const rightX = offsetX + element.width;
  const bottomY = offsetY + element.height;

  const margin = 30; // 固定的图形上下边距长度 （插件默认也是30）
  // let moveY = 0; // 记录Y轴下次递归应该增加的距离

  const isisExistPointX = (x) => (x >= offsetX && x <= rightX);
  const isisExistPointY = (y) => (y >= offsetY && y <= bottomY);

  // // 用来判断
  // const isExistPoint = ({x, y}) => {
  //   return isisExistPointX(x) && isisExistPointY(y);
  //  };
  
  // // 递归标识
  // const isExistCoverage = allShape.some(shape => {
   
  //   // 只判断task元素
  //   if(is(shape, "bpmn:Task")) {
  //     const { x: shapeX, y: shapeY, width, height } = shape;

  //     const leftUp = {
  //       x: shapeX,
  //       y: shapeY,
  //     }
  //     const leftDown = {
  //       x: shapeX,
  //       y: shapeY + height,
  //     }
  //     const rightUp = {
  //       x: shapeX + width,
  //       y: shapeY,
  //     }
  //     const rightDown = {
  //       x: shapeX + width,
  //       y: shapeY + height,
  //     }

  //     // 四个角坐标有一个处于新建图形大小范围之内的，都往下调整位置
  //     const isBreak = [leftUp,leftDown,rightUp,rightDown].some(point => isExistPoint(point))

  //     // if(isBreak){
  //     //   // 正在占位图形的下Y轴坐标 + 间距
  //     //   moveY = shapeY + height + margin;
  //     // }

  //     return isBreak;
      
  //     // return (shapeX >= offsetX && shapeX <= rightX) && (shapeY >= offsetY && shapeY <= bottomY)
  //   }
  // });
  // // 如果可以直接
  // if(!isExistCoverage) {
  //   return lastPosition;
  // }

  // if(offsetY === source.y && !isExistCoverage){
  //   return lastPosition;
  // }

  // 检索出与新建元素所处于同一列的所有元素
  const inColumnsShape = allShape.filter(shape => {
    const { x: shapeX, y: shapeY, width, height } = shape;
    const rightX = shapeX + width;

    return [shapeX, rightX].some(isisExistPointX);
  });

  // 找出同一列下，最低位的那个元素 (以下X坐标为准)
  const shapeLowest = inColumnsShape.sort((a,b) => (b.y + b.height) - (a.y + a.height))?.[0];

  console.log(shapeLowest, 'shapeLowest');
  console.log(inColumnsShape, 'inColumnsShape');

  if(shapeLowest && is(shapeLowest, "bpmn:Task")){
    const moveY = shapeLowest.y + shapeLowest.height + margin;
    lastPosition.y = moveY + element.height / 2; // 得到中心点的坐标

    const outerShapeMoveY = (lastPosition.y - element.height / 2) - source.y;
    outerShapeMove(source, shapeLowest, outerShapeMoveY, allShape, modeling);
  }

  // 返回最终坐标 （这个是以图形中心）
  return lastPosition;


  // // 用来判断
  // const isExistPoint = ({x, y}) => {
  //   return isisExistPointX(x) && isisExistPointY(y);
  //  };
  
  // // 递归标识
  // const isExistCoverage = allShape.some(shape => {
   
  //   // 只判断task元素
  //   if(is(shape, "bpmn:Task")) {
  //     const { x: shapeX, y: shapeY, width, height } = shape;

  //     const leftUp = {
  //       x: shapeX,
  //       y: shapeY,
  //     }
  //     const leftDown = {
  //       x: shapeX,
  //       y: shapeY + height,
  //     }
  //     const rightUp = {
  //       x: shapeX + width,
  //       y: shapeY,
  //     }
  //     const rightDown = {
  //       x: shapeX + width,
  //       y: shapeY + height,
  //     }

  //     // 四个角坐标有一个处于新建图形大小范围之内的，都往下调整位置
  //     const isBreak = [leftUp,leftDown,rightUp,rightDown].some(point => isExistPoint(point))

  //     if(isBreak){
  //       // 正在占位图形的下Y轴坐标 + 间距
  //       moveY = shapeY + height + margin;
  //     }

  //     return isBreak;
      
  //     // return (shapeX >= offsetX && shapeX <= rightX) && (shapeY >= offsetY && shapeY <= bottomY)
  //   }
  // });

  // console.log(isExistCoverage, 'isExistCoverage');

  // if(isExistCoverage) {
  //   // lastPosition.x = lastPosition.x + element.width / 2; // 如果需要平移，可以修改x轴位置
  //   // lastPosition.y = lastPosition.y + element.height / 2; // 往下移动半个身位
  //   lastPosition.y = moveY + element.height / 2; // 得到中心点的坐标

  //   // 递归继续判断位置，直至找到一块空地
  //   return customGetCoordinate(lastPosition, elementRegistry, source, element)
  // }

  // if(shapeLowest && is(shapeLowest, "bpmn:Task")){
  //   const moveY = shapeLowest.y + shapeLowest.height + margin;
  //   lastPosition.y = moveY + element.height / 2; // 得到中心点的坐标
  // }

  // // 返回最终坐标 （这个是以图形中心）
  // return lastPosition;
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

  const lastPosition = findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));

  // 自定义获取
  return customGetCoordinate(lastPosition, elementRegistry, modeling, source, element);
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

function isConnection(element) {
  return !!element.waypoints;
}