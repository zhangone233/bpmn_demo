import React from "react";
import "./BpmnModelerApp.css";

// import BpmnModeler from "bpmn-js/lib/Modeler";
import BpmnModeler from "../custom/modeler";

// import testDiagram from '../common/xml/diagram.xml';
import getDefaultXml from "../common/xml/getDefaultXml";

import "bpmn-js/dist/assets/diagram-js.css"; // 左边工具栏以及编辑节点的样式
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css"; // 右边工具栏样式

// 这里引入的是右侧属性栏这个框 （属性面板）
import propertiesPanelModule from "bpmn-js-properties-panel";
// 而这个引入的是右侧属性栏里的内容 （属性面板内容提供者）
//  import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'

// 自定义的 properties-panel内容
import propertiesProviderModule from "../custom/properties-panel-extension/provider/authority";
import authorityModdleDescriptor from "../custom/properties-panel-extension/descriptors/authority.json";

// 一个描述的json
// 查看camunda-bpmn-moddle/resources/camunda的源码就会发现, 这其实就是一个json文件.
// 里面存放的就是对各个属性的描述. 我们在后面自定义properties-panel的时候也会需要编写这样的一个json文件,
import camundaModdleDescriptor from "camunda-bpmn-moddle/resources/camunda";

import customPalette from "../custom/palette";
import paletteEntries from "../custom/palette/config/paletteEntries";

import customRenderer from "../custom/renderer";

import Panel from "../components/panel/panel";

class BpmnModelerApp extends React.Component {
    constructor() {
        super();

        this.state = {
            BpmnModeler: null,
        };
    }

    componentDidMount() {
        this.initBpmnModeler();
    }

    initBpmnModeler = async () => {
        // // 去除默认工具栏
        // const modules = BpmnModeler.prototype._modules;
        // const index = modules.findIndex(it => it.paletteProvider);
        // modules.splice(index, 1);

        const bpmnModeler = new BpmnModeler({
            container: "#canvas",

            // paletteEntries, // 引入工具栏配置 (自定义)

            propertiesPanel: {
                parent: "#properties-panel",
            },

            additionalModules: [
                // customPalette,
                // customRenderer,
                propertiesPanelModule,
                propertiesProviderModule,
            ],

            moddleExtensions: {
                //如果要在属性面板中维护camunda：XXX属性，则需要此
                // camunda: camundaModdleDescriptor,
                // authority: authorityModdleDescriptor, // 自定义属性面板 tab栏
            },
        });

        this.setState(
            {
                bpmnModeler,
            },
            () => {
                this.bpmnModelerImportXML();
            }
        );
    };

    bpmnModelerImportXML = async () => {
        const { bpmnModeler } = this.state;
        await bpmnModeler.importXML(getDefaultXml());

        // 画布视图调整在正中间
        bpmnModeler.get("canvas").zoom("fit-viewport", "auto");

        this.bpmnModelerAddEventListener(bpmnModeler);
    };

    bpmnModelerAddEventListener = bpmnModeler => {
        const eventBus = bpmnModeler.get("eventBus");

        // eventBus.on("selection.changed", e => {
        //   console.log(e, 'selection');
        // });

        // eventBus.on("element.changed", e => {
        //     console.log("element.changed触发", e);
        // });
    };

    render() {
        const { bpmnModeler } = this.state;

        return (
            <div className='container'>
                <div id='properties-panel' className='panel' />
                <div id='canvas' />

                {/* <Panel bpmnModeler={bpmnModeler} /> */}
            </div>
        );
    }
}

export default BpmnModelerApp;
