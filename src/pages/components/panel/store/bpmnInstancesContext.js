import { createContext } from "react";

export const initialBpmnInstancesContext = {
    modeler: {},
    modeling: {},
    moddle: {},
    eventBus: {},
    bpmnFactory: {},
    elementFactory: {},
    elementRegistry: {},
    replace: {},
    selection: {},

    elementInfo: {
        bpmnElement: {},
        elementId: null,
        elementType: "",
        elementBusinessObject: {},
    },
};

export default createContext(initialBpmnInstancesContext);
