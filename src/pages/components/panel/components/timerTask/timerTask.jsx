import React, { createRef } from "react";
import { Card, Row, Col, Input, Select, Form, Button } from "antd";
import _ from "loadsh";
import BpmnInstancesContext from "../../store/bpmnInstancesContext";

const { Option } = Select;

const initialFormValue = {
  id: "",
  name: "",
  age: "",
  address: "",
};

class FormApp extends React.PureComponent {
  static defaultProps = {
    elementBusinessObject: {},
    changeIsCurrentPanelComponentChecked: () => null,
  };

  // 拿到Context     this.context
  static contextType = BpmnInstancesContext;

  state = {
    // 当前选中节点的基本数据信息
    elementBaseInfo: {
      ...initialFormValue,
    },
  };
  isCheckPassed = false;
  FormInstanceRef = createRef(null);

  componentDidMount() {
    // this.handleCheckForm();
  }

  componentDidUpdate(prevProps) {
    if (this.props.elementBusinessObject !== prevProps.elementBusinessObject) {
      // 重置元素的基本数据信息
      this.resetBaseInfo();
    }
  }

  resetBaseInfo = () => {
    // $attrs属性是不可枚举的。  props.elementBusinessObject 已经被JSON.parse过。  从这个对象上获取不到$attrs
    const { bpmnElement } = this.context.elementInfo;
    const { elementBaseInfo: currentElementBaseInfo } = this.state;

    const elementBaseInfo = JSON.parse(JSON.stringify(bpmnElement.businessObject || {}));

    Object.assign(
      elementBaseInfo,
      JSON.parse(JSON.stringify(bpmnElement.businessObject.$attrs || {}))
    );

    const formFieldInfo = _.pick(elementBaseInfo, Object.keys(initialFormValue));
    const { id } = formFieldInfo;

    if (id !== currentElementBaseInfo.id) {
      this.setState(
        {
          elementBaseInfo: {
            ...initialFormValue,
            ...formFieldInfo,
          },
        },
        () => {
          // 同一个task，不同的图形信息切换。 重新自动校验一下表单
          this.handleCheckForm();
        }
      );
    } else {
      this.setState({
        elementBaseInfo: {
          ...currentElementBaseInfo,
          ...formFieldInfo,
        },
      });
    }
  };

  updateBaseInfo = (key, value) => {
    const {
      elementInfo: { bpmnElement },
      modeling,
    } = this.context;

    const attrObj = Object.create(null);
    attrObj[key] = value;

    modeling.updateProperties(bpmnElement, attrObj);
  };

  handleCheckForm = () => {
    const { changeIsCurrentPanelComponentChecked } = this.props;
    try {
      this.FormInstanceRef.current?.validateFields().then(
        values => {
          // 校验通过
          console.log(values, "通过");
          changeIsCurrentPanelComponentChecked(true);
        },
        errorInfo => {
          // 校验不通过
          console.log(errorInfo, "失败");

          changeIsCurrentPanelComponentChecked(false);
        }
      );
    } catch (e) {
      changeIsCurrentPanelComponentChecked(false);
    }
  };

  onValuesChange = changedValues => {
    Object.entries(changedValues).forEach(([key, value]) => {
      this.updateBaseInfo(key, value);
    });

    Promise.resolve().then(this.handleCheckForm);
  };

  render() {
    const { elementBaseInfo } = this.state;

    return (
      <Card style={{ width: "100%" }}>
        <Row gutter={[0, 10]}>
          <Col span={24}>
            <h2>{elementBaseInfo.id || "未知"}</h2>
          </Col>
        </Row>

        <Form
          key={elementBaseInfo.id}
          name={elementBaseInfo.id}
          ref={this.FormInstanceRef}
          name={elementBaseInfo.id}
          initialValues={elementBaseInfo}
          onValuesChange={this.onValuesChange}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete='off'
        >
          <Form.Item
            label='name'
            name='name'
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='age'
            name='age'
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Select style={{ width: "100%" }} allowClear>
              <Option value='1'>1</Option>
              <Option value='2'>2</Option>
              <Option value='3'>3</Option>
              <Option value='18'>18</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name='address'
            label='地址'
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type='primary' onClick={this.handleCheckForm}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}

export default FormApp;
