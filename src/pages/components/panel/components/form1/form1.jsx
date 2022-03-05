import React from "react";
import { Card, Row, Col, Input, Select } from "antd";
import BpmnInstancesContext from "../../store/bpmnInstancesContext";

const { Option } = Select;

class Form extends React.PureComponent {
    // 拿到Context     this.context
    static contextType = BpmnInstancesContext;

    state = {
        // 当前选中节点的基本数据信息
        elementBaseInfo: {},
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

        this.setState({
            elementBaseInfo,
        });
    };

    onChange = e => {
        const id = e.target.value;
        this.updateBaseInfo("name", id);
    };

    onSelectChange = value => {
        this.updateBaseInfo("age", value);
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

    render() {
        const { elementBaseInfo } = this.state;
        const { id, name, age } = elementBaseInfo;

        return (
            <Card style={{ width: 300 }}>
                <Row gutter={[0, 10]}>
                    <Col span={24}>
                        <h2>{id || "未知"}</h2>
                    </Col>

                    <Col span={24}>
                        <Row>
                            <Col span={4}>名字</Col>
                            <Col span={18}>
                                <Input
                                    key={id}
                                    placeholder='Basic usage'
                                    defaultValue={name || ""}
                                    onChange={this.onChange}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col span={24}>
                        <Row>
                            <Col span={4}>年龄</Col>
                            <Col span={18}>
                                <Select
                                    value={age || ""}
                                    style={{ width: 120 }}
                                    onChange={this.onSelectChange}
                                    style={{ width: "100%" }}
                                >
                                    <Option value='1'>1</Option>
                                    <Option value='2'>2</Option>
                                    <Option value='3'>3</Option>
                                    <Option value='18'>18</Option>
                                </Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        );
    }
}

export default Form;
