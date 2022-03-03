// AuthorityPropertiesProvider.js

import inherits from 'inherits';
// 引入自带的PropertiesActivator,  因为我们要用到它来处理eventBus
import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

// 内置处理props
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';

// createAuthorityTabGroups  custom props
import TitleProps from './parts/TitleProps';

// 内置
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {

    var generalGroup = {
        id: 'general',
        label: 'General',
        entries: []
    };
    idProps(generalGroup, element, translate);
    nameProps(generalGroup, element, bpmnFactory, canvas, translate);
    processProps(generalGroup, element, translate);

    var detailsGroup = {
        id: 'details',
        label: 'Details',
        entries: []
    };
    linkProps(detailsGroup, element, translate);
    eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

    var documentationGroup = {
        id: 'documentation',
        label: 'Documentation',
        entries: []
    };

    documentationProps(documentationGroup, element, bpmnFactory, translate);

    return [
        generalGroup,
        detailsGroup,
        documentationGroup
    ];
}

// 自定义
function createAuthorityTabGroups(element, translate) {
    var editAuthorityGroup = {
        id: 'edit-authority',
        label: '编辑权限',
        entries: [] // 属性集合
    }
    // 每个属性都有自己的props方法
    TitleProps(editAuthorityGroup, element, translate);
    // OtherProps1(editAuthorityGroup, element);
    // OtherProps2(editAuthorityGroup, element);
    
    return [
        editAuthorityGroup
    ];
}


export default function AuthorityPropertiesProvider(
    eventBus, bpmnFactory, canvas,
    elementRegistry, translate
) {  
    // 这里是要用到什么就引入什么

    PropertiesActivator.call(this, eventBus);
    
    this.getTabs = function(element) {
      var generalTab = {
          id: 'general',
          label: 'General',
          groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate)
      };

      var authorityTab = {
          id: 'authority',
          label: '权限',
          groups: createAuthorityTabGroups(element, translate)
      };
      return [
          generalTab,
          authorityTab
      ];
  }
}

const F = function() {}; // 核心，利用空对象作为中介；
F.prototype = PropertiesActivator.prototype; // 核心，将父类的原型赋值给空对象F；
AuthorityPropertiesProvider.prototype = new F(); // 核心，将 F的实例赋值给子类；
AuthorityPropertiesProvider.prototype.constructor = AuthorityPropertiesProvider; // 修复子类AuthorityPropertiesProvider的构造器指向，防止原型链的混乱；

// inherits(AuthorityPropertiesProvider, PropertiesActivator);
