import CustomPalette from './palette/CustomPalette'
import CustomRenderer from './renderer/CustomRenderer'
import CustomContextPadProvider from './contextPad/CustomContextPadProvider'
// import CustomContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider'

export default {
    __init__: ['paletteProvider', 'customRenderer', 'contextPadProvider'],
    paletteProvider: ['type', CustomPalette],
    customRenderer: ['type', CustomRenderer],
    contextPadProvider: ['type', CustomContextPadProvider]
}