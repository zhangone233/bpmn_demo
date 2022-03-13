import CustomPalette from './palette/CustomPalette'
import CustomRenderer from './renderer/CustomRenderer'
import CustomContextPadProvider from './contextPad/CustomContextPadProvider'
// import CustomContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider'

import CustomTranslate from './customTranslate/CustomTranslate';

export default {
    __init__: ['paletteProvider', 'customRenderer', 'contextPadProvider', 'translate'],
    paletteProvider: ['type', CustomPalette],
    customRenderer: ['type', CustomRenderer],
    contextPadProvider: ['type', CustomContextPadProvider],
    translate: ['value', CustomTranslate],
}