import Modeler from 'bpmn-js/lib/Modeler'
// import inherits from 'inherits'
// import CustomModule from './custom'
import CustomModule from './palette'
import BpmnAutoPlace from '../auto-place';

export default function CustomModeler(options) {
    Modeler.call(this, options)
    this._customElements = []
}

// inherits(CustomModeler, Modeler)

const F = function() {}; // 核心，利用空对象作为中介；
F.prototype = Modeler.prototype; // 核心，将父类的原型赋值给空对象F；
CustomModeler.prototype = new F(); // 核心，将 F的实例赋值给子类；
CustomModeler.prototype.constructor = CustomModeler; // 修复子类CustomModeler的构造器指向，防止原型链的混乱；

CustomModeler.prototype._modules = [].concat(
  CustomModeler.prototype._modules, [
      CustomModule,
      BpmnAutoPlace
  ]
)