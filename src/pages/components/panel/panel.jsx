import React, { createRef } from "react";
import "./panel.css";

import highlight from "highlight.js";
import { Modal } from "antd";

import BpmnInstancesContext, {
  initialBpmnInstancesContext,
} from "./store/bpmnInstancesContext";

import { BPMN_PUBLIC_STATE } from "../../custom/modeler/utils/util";

const path = require("path");
const CustomPropertiesPanelComponents = {};
const CustomPropertiesPanelComponentsFiles = require.context(
  "./components",
  true,
  /\.jsx$/
);

//  keys()返回components文件夹下所有以.js结尾的文件的文件名,返回文件名组成的数组  fileName为./timerTask/index.js
CustomPropertiesPanelComponentsFiles.keys().forEach(fileUrl => {
  const fileName = path.basename(fileUrl, ".jsx"); // 'xxx.js'
  CustomPropertiesPanelComponents[fileName] =
    CustomPropertiesPanelComponentsFiles(fileUrl).default ||
    CustomPropertiesPanelComponentsFiles(fileUrl);
});

class Panel extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      xml: "",
      isPreviewModalVisible: false,

      bpmnInstancesContext: initialBpmnInstancesContext,
      CurrentPanelComponent: () => null,
    };
  }
  initModelTimer = null;
  previewDomRef = createRef(null);
  isCurrentPanelComponentChecked = true;

  changeIsCurrentPanelComponentChecked = isChecked => {
    this.isCurrentPanelComponentChecked = isChecked;
    BPMN_PUBLIC_STATE.IS_CREATE = isChecked;
  };

  componentDidMount() {
    this.initModels();
  }

  initModels = () => {
    const { bpmnModeler } = this.props;

    // 初始化 modeler 以及其他 moddle
    if (!bpmnModeler) {
      // 避免加载时 流程图 并未加载完成
      this.initModelTimer = setTimeout(() => this.initModels(), 10);
      return;
    }
    if (this.initModelTimer) clearTimeout(this.initModelTimer);

    const bpmnInstancesContext = {
      ...initialBpmnInstancesContext,
      modeler: bpmnModeler,
      modeling: bpmnModeler.get("modeling"),
      moddle: bpmnModeler.get("moddle"),
      eventBus: bpmnModeler.get("eventBus"),
      bpmnFactory: bpmnModeler.get("bpmnFactory"),
      elementFactory: bpmnModeler.get("elementFactory"),
      elementRegistry: bpmnModeler.get("elementRegistry"),
      replace: bpmnModeler.get("replace"),
      selection: bpmnModeler.get("selection"),
    };

    this.setState(
      {
        bpmnInstancesContext,
      },
      () => {
        this.getActiveElement();
      }
    );
  };

  getActiveElement = () => {
    const { bpmnModeler } = this.props;

    // 初始第一个选中元素 bpmn:Process
    this.initFormOnChanged(null);

    bpmnModeler.on("import.done", e => {
      // console.log('import.done',e)
      this.initFormOnChanged(null);
    });

    // 监听选择事件，修改当前激活的元素以及表单
    bpmnModeler.on("selection.changed", ({ newSelection }) => {
      const {
        selection, // 选中图形的方法
        elementInfo: { bpmnElement }, // 当前选中的图形  shape
      } = this.state.bpmnInstancesContext;

      let newSelectionElement = newSelection[0]; // 点击切换的元素

      if (newSelectionElement?.id !== "Process_1" && bpmnElement?.id !== "Process_1") {
        if (
          bpmnElement?.id !== newSelectionElement?.id &&
          !this.isCurrentPanelComponentChecked
        ) {
          selection.select(bpmnElement);
          newSelectionElement = bpmnElement;
          console.log("当前组件form未校验通过");
        }
      } else {
        this.isCurrentPanelComponentChecked = true;
      }

      const panelName = newSelectionElement?.id?.split("_")[0] || "";
      this.setState({
        CurrentPanelComponent: CustomPropertiesPanelComponents[panelName] || (() => null),
      });

      this.initFormOnChanged(newSelectionElement || null);
    });

    bpmnModeler.on("element.changed", ({ element }) => {
      console.log("修改了 xml");

      const { elementInfo } = this.state.bpmnInstancesContext;

      if (process.env.NODE_ENV === "development") {
        bpmnModeler.saveXML({ format: true }).then(xmlObj => {
          this.setState({
            xml: xmlObj.xml,
          });
        });
      }

      // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
      if (element && element.id === elementInfo.elementId) {
        this.initFormOnChanged(element);
      }
    });
  };

  // 初始化数据
  initFormOnChanged = element => {
    const { bpmnInstancesContext } = this.state;
    const { elementRegistry } = bpmnInstancesContext;

    let activatedElement = element;

    if (!activatedElement) {
      // 寻找初始化选中元素 bpmn:Process
      activatedElement =
        elementRegistry.find(el => el.type === "bpmn:Process") ??
        elementRegistry.find(el => el.type === "bpmn:Collaboration");
    }
    if (!activatedElement) return;

    // Log.printBack(`select element changed: id: ${activatedElement.id} , type: ${activatedElement.businessObject.$type}`);
    // Log.prettyInfo("businessObject", activatedElement.businessObject);

    const bpmnElement = activatedElement;
    const elementId = activatedElement.id;
    const elementType = activatedElement.type.split(":")[1] || "";
    const elementBusinessObject = JSON.parse(
      JSON.stringify(activatedElement.businessObject)
    );

    const elementInfo = {
      bpmnElement,
      elementId,
      elementType,
      elementBusinessObject,
    };

    this.setState({
      bpmnInstancesContext: {
        // 更新Context
        ...bpmnInstancesContext,
        elementInfo,
      },
    });
  };

  render() {
    const {
      bpmnInstancesContext,
      bpmnInstancesContext: {
        elementInfo: { elementBusinessObject },
      },

      xml,
      isPreviewModalVisible,
      CurrentPanelComponent,
    } = this.state;

    return (
      <div className='custom-panel-container'>
        <BpmnInstancesContext.Provider value={bpmnInstancesContext}>
          <CurrentPanelComponent
            elementBusinessObject={elementBusinessObject}
            changeIsCurrentPanelComponentChecked={
              this.changeIsCurrentPanelComponentChecked
            }
          />
        </BpmnInstancesContext.Provider>

        <div className='tool-bar'>
          <button
            onClick={() => {
              this.setState({ isPreviewModalVisible: true }, () => {
                try {
                  setTimeout(
                    () => highlight.highlightBlock(this.previewDomRef.current),
                    0
                  );
                } catch (e) {
                  console.error(e);
                }
              });
            }}
          >
            预览xml
          </button>

          <Modal
            title='预览 XML'
            visible={isPreviewModalVisible}
            onCancel={() => this.setState({ isPreviewModalVisible: false })}
            footer={null}
            style={{ width: "1200px" }}
          >
            <pre id='pre_xml' ref={this.previewDomRef}>
              {xml}
            </pre>
          </Modal>
        </div>
      </div>
    );
  }
}

export default Panel;
