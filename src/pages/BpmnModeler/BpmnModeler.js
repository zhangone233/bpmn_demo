import React from "react";
import "./BpmnModelerApp.css";

// import BpmnModeler from "bpmn-js/lib/Modeler";
import BpmnModeler from "../customModeler";

// lint
import lintModule from "bpmn-js-bpmnlint";
import bpmnlintConfig from "../../packed-config";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";

import fileDrop from "file-drops";

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
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";

const path = require('path')
console.log(path,'path');

class BpmnModelerApp extends React.Component {
  constructor() {
    super();

    this.state = {
      BpmnModeler: null,
    };
  }

  componentDidMount() {
    this.initBpmnModeler();
    document.querySelector('body').addEventListener('dragover', this.dndHandler);
  }

  initBpmnModeler = async () => {
    // // 去除默认工具栏
    // const modules = BpmnModeler.prototype._modules;
    // const index = modules.findIndex(it => it.paletteProvider);
    // modules.splice(index, 1);

    const bpmnModeler = new BpmnModeler({
      container: "#canvas",

      linting: {
        bpmnlint: bpmnlintConfig,
        active: this.getUrlParam('linting')
      },

      propertiesPanel: {
        parent: "#properties-panel",
      },

      additionalModules: [propertiesPanelModule, propertiesProviderModule, lintModule],

      moddleExtensions: {},
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

    bpmnModeler.on('linting.toggle', (event) => {
        console.log('111111');
        const active = event.active;
        this.setUrlParam('linting', active);
    });
  };

  dndHandler = fileDrop("Drop BPMN Diagram here.",  (files) => {
    this.bpmnModeler.importXML(files[0].contents);
  });

  // 流程校验使用
  setUrlParam = (name, value) => {
    var url = new URL(window.location.href);

    if (value) {
      url.searchParams.set(name, 1);
    } else {
      url.searchParams.delete(name);
    }

    window.history.replaceState({}, null, url.href);
  };
  // 流程校验使用
  getUrlParam = name => {
    var url = new URL(window.location.href);

    return url.searchParams.has(name);
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
