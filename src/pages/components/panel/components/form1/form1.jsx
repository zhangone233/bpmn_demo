import React from "react";
import { Card, Row, Col, Input, Select, Form, Button } from "antd";
import _ from "loadsh";
import BpmnInstancesContext from "../../store/bpmnInstancesContext";

const { Option } = Select;

const initialFormValue = {
  id: "",
  name: "",
  age: "",
};

class FormApp extends React.PureComponent {
  // 拿到Context     this.context
  static contextType = BpmnInstancesContext;

  state = {
    // 当前选中节点的基本数据信息
    elementBaseInfo: {
      ...initialFormValue,
    },
  };

  componentDidUpdate(prevProps) {
    if (this.props.elementBusinessObject !== prevProps.elementBusinessObject) {
      // 重置元素的基本数据信息
      this.resetBaseInfo();
    }
  }

  resetBaseInfo = () => {
    // $attrs属性是不可枚举的。  props.elementBusinessObject 已经被JSON.parse过。  从这个对象上获取不到$attrs
    const { bpmnElement } = this.context.elementInfo;
    const elementBaseInfo = JSON.parse(JSON.stringify(bpmnElement.businessObject || {}));

    Object.assign(
      elementBaseInfo,
      JSON.parse(JSON.stringify(bpmnElement.businessObject.$attrs || {}))
    );

    const formFieldInfo = _.pick(elementBaseInfo, Object.keys(initialFormValue));

    this.setState({
      elementBaseInfo: {
        ...this.state.elementBaseInfo,
        ...formFieldInfo,
      },
    });
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

  onSubmit = errors => {
    console.log(errors, "errors");
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
          name={elementBaseInfo.id}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={elementBaseInfo}
          onFinish={this.onSubmit}
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
            <Select style={{ width: "100%" }}>
              <Option value='1'>1</Option>
              <Option value='2'>2</Option>
              <Option value='3'>3</Option>
              <Option value='18'>18</Option>
            </Select>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}

export default FormApp;
