import inherits from 'inherits'

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider'

export default function CustomRules(eventBus) {
    RuleProvider.call(this, eventBus)
}

inherits(CustomRules, RuleProvider)

CustomRules.$inject = ['eventBus']

CustomRules.prototype.init = function () {
    this.addRule(['connection.create', 'shape.create'], 1234, function (context) {
        var shape = context.shape,
            target = context.target
        // var shapeBo = shape.businessObject,
        //     targetBo = target.businessObject

        // var allowDrop = targetBo.get('vendor:allowDrop')

        // if (!allowDrop || !shapeBo.$instanceOf(allowDrop)) {
        //     return false
        // }
        console.log('context', context)
        // return false
    })
}
