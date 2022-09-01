
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

/** 
 * 重新理一遍先
 * 先思路，后撸码。 之所谓码道 ---- ‘先礼后兵’。
 * 
 *  > 一些黑话单词：
 *    + source 指创建源shape元素。即新建图形元素的默认父级元素，被点击创建的触发源头
 *    + element 指创建出来即将添加到画布的新元素
 *    + position 坐标信息。{ x: number; y: number }
 * 
 * ## 已知ContextPad点击创建task图形会得到的信息：
 *  1. 当source平行方向没有其它元素时，会自动计算出右边的 position,然后放置新元素
 *  2. 当source平行方向已有了子元素占位，会自动计算出右下的 position，然后放置新元素
 *  3. 如果平行方向右边已经有了元素占位，但并不是当前source的子元素，那么这次创建会视为右边无物。（即位置重合）
 *  总结: 插件自带的autoPlace模块只会根据source的近亲元素进行位置计算，且默认方向只有 平行右 与 平行右下
 * 
 * ## 固定常量
 * 1. 默认左右边距 40 （本次这个应该无需操作）
 * 2. 默认上下边距 30
 * 3. bpmn:task   图形默认宽度：100     高度：80
 * 
 * ## 需求实现
 * 声明注释变量： （乱编的操作😅）
 * var elementMoveMode = null;
 * 
 * 1. 每次创建新元素时，拿到插件自己算出的 position信息。判断这个位置上是否存在其它元素。 （注意避免被上下包夹）
 *      存在：
 *         先判断这个 position位置的上面是否有元素：
 *              如果有:
 *                判断下面是否也有元素：
 *                  如果也有：
 *                    判断上面元素与下面元素是否为兄弟关系？
 *                      如果是
 *                        走第下面第2步中的往下判断流程
 *                      如果不是：
 *                        补位放置
 *                  如果没有：
 *                    走第下面第2步中的往下判断流程，应该是补位放置
 *              如果没有：
 *                直接放置
 * 
 *      不存在：直接以当前 position放置新元素。
 * 
 * 2. 如果 position 已经有元素占位，且不是当前source的子节点，不能让新元素进行堆叠放置。 需要计算出往右下排列的位置。
        如果右下面依然存在其它元素？：
          那么需要判断已有的右下元素是否与上面的元素是兄弟关系？即同属一个父级？：
            如果是：就再继续往下一格位置计算，重复上面的判断流程。
            如果不是：就进行插入放置。即：
              elementMoveMode = (
                > var nextPosition = 新元素确认要放置位置的坐标; （也是原先位置上的元素坐标）
                > var beforeTargetElement = 已有的原位置元素
                a. 先计算出，父级元素下移到最终与新元素平行位置的所需单位距离：sourceOffsetMoveY
                b. 以 nextPosition 的左上角坐标为一个往右下方向延伸直角线的区域范畴：rawElementRightAngleArea ----- (暂时弃用)
                b. var needMoveElements = 获取 beforeTargetElement 元素所有子节点元素（应该有系统API可以调用吧？）+ 所有子节点位置下面的所有元素 + loop,以及本身位置下面的所有元素。 (需要深度递归集合)
                c. 将 rawElementRightAngleArea 范畴内的元素全部下移 sourceOffsetMoveY 的距离。 （这里待定是下移父级相同的距离，亦或是1个单位就足够） ----- (暂时弃用)
                c. needMoveElements 中的元素全部下移 sourceOffsetMoveY 的距离。 （这里待定是下移父级相同的距离，亦或是1个单位就足够）
                d. 然后将新元素放入到刚刚腾出来的位置。
                e. 新元素的位置确认放置以后，以父级元素的右上角坐标为一个往左下方向延伸直角线的区域范畴：sourceRightAngleArea
                f. 凡是在 sourceRightAngleArea 范畴内的元素，全部下移 sourceOffsetMoveY 的距离。
              )
        如果右下角不存在其它元素: 
          进行补位放置。即：elementMoveMode  （可能 rawElementRightAngleArea/needMoveElements 范畴的移动距离会有微变，以实现为准）

 * 3.起始行元素作为source父元素，无需下移。需要进行特殊判断。
        a. 每次进行 elementMoveMode 操作时，都对source进行判断是否为起始行元素。
        b. 判断source的上面是否还有元素，如果有可能是多个。那么挨个判断这些元素中是否具有与source为兄弟关系的。如果有，则不把source当起始行父元素。
        c. 如果当前source为起始行元素
              1. 那么 elementMoveMode 的 sourceRightAngleArea 参照坐标点元素修改为 source的下一个元素。 （如果没有下一个，就啥也不做）
              2. 如果进行的是插入放置，那么

*/

/**
 * 画布坐标图 （ x、y ）
 * 
 *                     0, -1
 *                       |
 *                       |
 *                       |
 *                       |
 *                       |
 *                       |
 * -1, 0 -------------- 0,0 -------------- 1, 0
 *                       |
 *                       |
 *                       |
 *                       |
 *                       |
 *                       |
 *                      0, 1
 */


/** 判断一个平行点是否处于两个平行点之间 */
const isExistHorizontalPoint = (x, targetLeftX, targetRightX) => (x >= targetLeftX && x <= targetRightX);
/** 判断一个垂直点是否处于两个垂直点之间 */
const isExistVerticalPoint = (y, targetTopY, targetBottomY) => (y >= targetTopY && y <= targetBottomY);

/** 判断一个坐标是否存在一个四角矩形坐标范畴内 */
const isExistPoint = (point, targetPoint) => {
  const { x, y } = point;
  const {
    targetLeftX,
    targetRightX,
    targetTopY,
    targetBottomY
  } = targetPoint;
  return isExistHorizontalPoint(x, targetLeftX, targetRightX) && isExistVerticalPoint(y, targetTopY, targetBottomY);
};

/**
 * 获取新加task元素的四点坐标
 * @param {*} lastPosition 
 * @param {*} element 
 * @returns 
 */
export const getTaskShapeFourCornersPoint = (lastPosition, element) => {
  const { x, y } = lastPosition;

  // 目标位置是一个四边矩形。 先得到四边坐标，得出一个判断范畴。
  const targetLeftX = x; // 左边线 x 点
  const targetTopY = y; // 上边线 y 点
  const targetRightX = x + element.width; // 右边线 x 点
  const targetBottomY = y + element.height; // 下边线 y 点

  return {
    targetLeftX,
    targetRightX,
    targetTopY,
    targetBottomY
  };
}


/**
 * 指定一个位置，判断是否已经具有元素存在
 * @returns boolean
 */
export const isDesignatedPointAlreadyExists = (args) => {
  const {
    element,
    lastPosition,
    allShapeElements, 
    targetColumnElements,
  } = args;

  const targetPoint = getTaskShapeFourCornersPoint(lastPosition, element)

  // lastPosition 位置范围内，是否已经具有其它元素的存在
  const coverageElement = targetColumnElements.find(shapeElement => {
    const { x: shapeX, y: shapeY, width, height } = shapeElement;

    // 获取遍历到的每个元素四角坐标点
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

      return [leftUp, leftDown, rightUp, rightDown].some(point => isExistPoint(point, targetPoint))
  });

  const isExistPlaceholder = Boolean(coverageElement);
  console.log(isExistPlaceholder, 'isExistPlaceholder');

  return {
    isExistPlaceholder, // 是否已被占位
    placeholderElement, // 占位的当前元素
  };
}

/**
 * 判断一组元素是否为兄弟关系
 * @returns: boolean
 */
export const isWhetherTheyAreBrothers = ({
  elements,
}) => {

}

/** 
 * 判断一个元素的上面是否存在元素
 * @returns:
 * @field1 element 距离最近的元素
 * @field2 elements 所有上面的元素集合
 */
export const isWhetherElementOnIt = () => {

}

/** 
 * 判断一个元素的下面是否存在元素 
 * @returns:
 * @field1 element 距离最近的元素
 * @field2 elements 所有下面的元素集合
 */
export const isWhetherElementBelow = () => {
  
}

/** 
 * 获取x轴上两点之间的所有元素。 即指定横向两点范围获取一列的元素集合
 * 按照下边线Y轴坐标从高到底排序
 */
export const getBetweenTwoPointsElements = ({targetLeftX, targetRightX}, allShapeElements) => {
  // 筛选
  const columnElements = allShapeElements.filter(shapeElement => {
    const { x, width } = shapeElement;
    const leftX = x;
    const rightX = x + width;

    return [leftX, rightX].some(point => isExistHorizontalPoint(point, targetLeftX, targetRightX));
  });

  // 排序
  const columnElementsSort = columnElements.sort((a, b) => {
    const { y:firstY, height:firstHeight } = a;
    const { y:secondY, height:secondHeight } = b;

    const firstBottomY = firstY + firstHeight;
    const secondBottomY = secondY + secondHeight;

    return firstBottomY - secondBottomY; // Y轴越大，越靠下
  })

  return columnElementsSort;
}

/**
 * 插入放置新元素
 */
export const insertPlaceElement = () => {}

/**
 * 补位放置新元素
 */
export const appendPlaceElement = () => {

}

/**
 * 查找应该放置的最终位置信息
 */
export const findPlacePosition = (args, extension) => {
  const {
    source,
    element,
    modeling,
    lastPosition,
    elementRegistry,
    allShapeElements,
    targetColumnElements
  } = args;

  let { placeholderElement } = extension;
  const latestPosition = { ...lastPosition };

  // 找到应该插入的位置或空位
  const a = targetColumnElements.find(columnElements => {
    
  });
  
  return {
    placeMode, // 放置方式
    latestPosition, // 放置位置
  }
}

/**
 * 1. 
 * 放置前，进行位置信息预判定，预先做一下操作
 */
export const locationInfoDetermination = (args) => {
  const {
    source,
    element,
    modeling,
    lastPosition,
    elementRegistry,
    allShapeElements,
    targetColumnElements
  } = args;

  const {
    isExistPlaceholder, // 是否已被占位
    placeholderElement, // 占位的当前元素
  } = isDesignatedPointAlreadyExists(args);

  // 没有已经存在的占位元素，就直接放置
  if(!isExistPlaceholder) {
    return {
      next: false
    }
  }

  const extension = {
    placeholderElement,
  }

  // 判断上面是否有其它元素

  // 判断下面是否有元素

  const {} = findPlacePosition(args, extension);

}


/**
 * 2.
 * 开始决定放置方案，及位置详细计算
 */
export const elementsArePlaced = () => {

}


/**
 * 3.
 * 下移挪动其它相关联元素
 */
export const movingRelevantElements = () => {

}

/** 起始 */
export const customStart = (args) => {
  const {
    source,
    element,
    modeling,
    lastPosition,
    elementRegistry,
  } = args;

  // 获取画布中所有图形shape对象集合
  const allShapeElements = elementRegistry.getAll()[0].children || []; 
  const targetColumnElements = getBetweenTwoPointsElements(getTaskShapeFourCornersPoint(lastPosition), allShapeElements);

  const args = { ...args, allShapeElements, targetColumnElements };

  // 1.
  const { next, } = locationInfoDetermination(args);

  if(!next) {
    return lastPosition;
  }

  return lastPosition;
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