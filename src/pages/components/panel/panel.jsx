import React from 'react';
import Form from './form/form';
import highlight from 'highlight.js';
import { Modal } from 'antd';

class Panel extends React.PureComponent {
  constructor(){
    super();

    this.state = {
      bpmnElement : {},
      elementId : '',
      elementType : '',
      elementBusinessObject : {},
      conditionFormVisible : false,
      formVisible : false,

      xml: '',
      isModalVisible: false,
    }

  }
  timer = null;

  componentDidMount() {
    this.initModels();
  }

  initModels = () => {
    const { bpmnModeler } = this.props;
    
    // 初始化 modeler 以及其他 moddle
    if (!bpmnModeler) {
      // 避免加载时 流程图 并未加载完成
      this.timer = setTimeout(() => this.initModels(), 10);
      return;
    }
    if (this.timer) clearTimeout(this.timer);

    window.bpmnInstances = {
      modeler: bpmnModeler,
      modeling: bpmnModeler.get("modeling"),
      moddle: bpmnModeler.get("moddle"),
      eventBus: bpmnModeler.get("eventBus"),
      bpmnFactory: bpmnModeler.get("bpmnFactory"),
      elementFactory: bpmnModeler.get("elementFactory"),
      elementRegistry: bpmnModeler.get("elementRegistry"),
      replace: bpmnModeler.get("replace"),
      selection: bpmnModeler.get("selection")
    };

    this.getActiveElement()
  }

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
      console.log('selection.changed','执行')

      this.initFormOnChanged(newSelection[0] || null);
    });

    bpmnModeler.on("element.changed", ({ element }) => {
      console.log('element.changed','执行');

      bpmnModeler.saveXML({ format: true }).then(xmlObj => {
        this.setState({
          xml: xmlObj.xml,
        })
      })

      // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
      if (element && element.id === this.state.elementId) {
        this.initFormOnChanged(element);
      }
    });
  }

  // 初始化数据
  initFormOnChanged = (element) => {
    let activatedElement = element;
    if (!activatedElement) {
      activatedElement =
        window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Process") ??
        window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Collaboration");
    }
    if (!activatedElement) return;
    // Log.printBack(`select element changed: id: ${activatedElement.id} , type: ${activatedElement.businessObject.$type}`);
    // Log.prettyInfo("businessObject", activatedElement.businessObject);
    window.bpmnInstances.bpmnElement = activatedElement;

    const bpmnElement = activatedElement;
    const elementId = activatedElement.id;
    const elementType = activatedElement.type.split(":")[1] || "";
    const elementBusinessObject = JSON.parse(JSON.stringify(activatedElement.businessObject));
    
    this.setState({
      bpmnElement,
      elementId,
      elementType,
      elementBusinessObject,
    })
  }
  
  render () {
    const {
      bpmnElement,
      elementId,
      elementType,
      elementBusinessObject,
      conditionFormVisible,
      formVisible,

      xml,
      isModalVisible,
    } = this.state;

    const elementInfo = {
      bpmnElement,
      elementId,
      elementType,
      elementBusinessObject,
      conditionFormVisible,
      formVisible,
    };

    return (
      <div style={{
        width: '320px',
        padding: '20px 10px',
        height: '100%',
        position: 'absolute',
        top:0,
        right:0,
        zIndex: 10,
      }}>
        <Form elementInfo={elementInfo} />

        <br />
        <br />
        <br />
        <button onClick={() => {
          this.setState({ isModalVisible: true }, () => {
            try{
              highlight.highlightBlock(document.getElementById('pre_xml'))
            } catch (e) {
              console.error(e)
            }
          });
        }}>
          预览xml
        </button>

        <Modal
          title="预览 XML"
          visible={isModalVisible}
          onCancel={() => this.setState({ isModalVisible: false })}
          footer={null}
          style={{ width: '1200px' }}
        >
          <pre id="pre_xml">
            {xml}
          </pre>
        </Modal>
      </div> 
    )
  }
}

export default Panel;