
import React from 'react';
import { Card, Row, Col, Input, Select } from 'antd'

const { Option } = Select;

class Panel extends React.PureComponent {
  state = {
    elementBaseInfo: {},
    bpmnElement: {},
  }

  componentDidUpdate(prevProps) {
    if(this.props.elementInfo.elementBusinessObject !== prevProps.elementInfo.elementBusinessObject) {
      this.resetBaseInfo();
    }
  }

  resetBaseInfo = () => {
    const bpmnElement = window?.bpmnInstances?.bpmnElement || {};
    const businessObject = bpmnElement?.businessObject || {};

    const elementBaseInfo = JSON.parse(JSON.stringify(bpmnElement?.businessObject || {}));
    Object.assign(elementBaseInfo, JSON.parse(JSON.stringify(businessObject.$attrs || {})));
   
    this.setState({
      elementBaseInfo,
      bpmnElement,
    })
  }

  onChange = (e) => {
    const id = e.target.value;
    this.updateBaseInfo('name', id)
  }

  onSelectChange = (value) => {
    this.updateBaseInfo('age', value)
  }

  updateBaseInfo = (key, value) => {
    const { bpmnElement } = this.state;

    const attrObj = Object.create(null);
    attrObj[key] = value;
    window.bpmnInstances.modeling.updateProperties(bpmnElement, attrObj);
  }

  render () {
    const { elementBaseInfo } = this.state;
    console.log(elementBaseInfo,'elementBaseInfo');

    return (
      <Card style={{ width: 300 }}>
          <Row gutter={[0, 10]}>
            <Col span={24}>
              <h2>{elementBaseInfo?.id || '未知'}</h2>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={4}>
                  名字
                </Col>
                <Col span={18}>
                  <Input placeholder="Basic usage" value={elementBaseInfo?.name || ''} onChange={this.onChange} />
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row>
                  <Col span={4}>
                    年龄
                  </Col>
                  <Col span={18}>
                    <Select value={elementBaseInfo?.age || ''} style={{ width: 120 }} onChange={this.onSelectChange} style={{width: '100%'}}>
                      <Option value="1">1</Option>
                      <Option value="2">2</Option>
                      <Option value="3">3</Option>
                      <Option value="18">18</Option>
                    </Select>
                  </Col>
                </Row>
            </Col>
          </Row>
        </Card>
    )
  }
}

export default Panel;