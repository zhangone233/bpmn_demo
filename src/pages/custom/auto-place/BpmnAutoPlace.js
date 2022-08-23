import { getNewShapePosition } from './BpmnAutoPlaceUtil';


/**
 * BPMN auto-place behavior.
 *
 * @param {EventBus} eventBus
 */
export default function AutoPlace(eventBus, modeling, elementRegistry) {
  console.log(elementRegistry,'elementRegistry');

  eventBus.on('autoPlace',10000, function(context) {
    var shape = context.shape,
        source = context.source;

    const position = getNewShapePosition(source, shape, elementRegistry);

    console.log(shape,'shape');
    console.log(source,'source');
    console.log(position,'position');

    // window.addEventListener('keydown', (e) => {
    //   console.log(e.key, modeling, 'e');
    //   if(e.key === 'ArrowUp'){
    //     // modeling.moveShape(shape, {
    //     //   x: shape.x + 10,
    //     // }, source)

    //     console.log(shape,'innnn shape');
    //     modeling.moveShape(shape, {
    //       x: 10,
    //       y: 10,
    //     })
    //   }

    //   if(e.key === 'ArrowDown'){
    //     modeling.moveShape(shape, {
    //       x: shape.x - 10,
    //     })
    //   }
    // });

    return position;
  });
}

AutoPlace.$inject = [ 'eventBus', 'modeling', 'elementRegistry' ];