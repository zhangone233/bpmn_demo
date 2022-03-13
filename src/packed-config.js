import translate from '../src/pages/custom/customTranslate/CustomTranslate';

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

/**
 * A rule that checks that sequence flows outgoing from a
 * conditional forking gateway or activity are
 * either default flows _or_ have a condition attached
 */

var conditionalFlows = function() {

  function check(node, reporter) {

    if (!isConditionalForking(node)) {
      return;
    }

    const outgoing = node.outgoing || [];

    outgoing.forEach((flow) => {
      const missingCondition = (
        !hasCondition$2(flow) &&
        !isDefaultFlow$1(node, flow)
      );

      if (missingCondition) {
        reporter.report(flow.id, translate('Sequence flow is missing condition'));
      }
    });
  }

  return {
    check
  };

};


// helpers /////////////////////////////

function isConditionalForking(node) {

  const defaultFlow = node['default'];
  const outgoing = node.outgoing || [];

  return defaultFlow || outgoing.find(hasCondition$2);
}

function hasCondition$2(flow) {
  return !!flow.conditionExpression;
}

function isDefaultFlow$1(node, flow) {
  return node['default'] === flow;
}

/**
 * Checks whether node is of specific bpmn type.
 *
 * @param {ModdleElement} node
 * @param {String} type
 *
 * @return {Boolean}
 */
function is$b(node, type) {

  if (type.indexOf(':') === -1) {
    type = 'bpmn:' + type;
  }

  return (
    (typeof node.$instanceOf === 'function')
      ? node.$instanceOf(type)
      : node.$type === type
  );
}

/**
 * Checks whether node has any of the specified types.
 *
 * @param {ModdleElement} node
 * @param {Array<String>} types
 *
 * @return {Boolean}
 */
function isAny$6(node, types) {
  return types.some(function(type) {
    return is$b(node, type);
  });
}

var index_esm = /*#__PURE__*/Object.freeze({
	__proto__: null,
	is: is$b,
	isAny: isAny$6
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(index_esm);

const {
  is: is$a,
  isAny: isAny$5
} = require$$0;


/**
 * A rule that checks the presence of an end event per scope.
 */
var endEventRequired = function() {

  function hasEndEvent(node) {
    const flowElements = node.flowElements || [];

    return (
      flowElements.some(node => is$a(node, 'bpmn:EndEvent'))
    );
  }

  function check(node, reporter) {

    if (!isAny$5(node, [
      'bpmn:Process',
      'bpmn:SubProcess'
    ])) {
      return;
    }

    if (!hasEndEvent(node)) {
      const type = is$a(node, 'bpmn:SubProcess') ? 'Sub process' : 'Process';

      reporter.report(node.id, translate(type) + translate(' is missing end event'));
    }
  }

  return { check };
};

const {
  is: is$9
} = require$$0;

/**
 * A rule that checks that start events inside an event sub-process
 * are typed.
 */
var eventSubProcessTypedStartEvent = function() {

  function check(node, reporter) {

    if (!is$9(node, 'bpmn:SubProcess') || !node.triggeredByEvent) {
      return;
    }

    const flowElements = node.flowElements || [];

    flowElements.forEach(function(flowElement) {

      if (!is$9(flowElement, 'bpmn:StartEvent')) {
        return false;
      }

      const eventDefinitions = flowElement.eventDefinitions || [];

      if (eventDefinitions.length === 0) {
        reporter.report(flowElement.id, translate('Start event is missing event definition'));
      }
    });
  }

  return {
    check
  };

};

const {
  isAny: isAny$4
} = require$$0;

/**
 * A rule that checks that no fake join is modeled by attempting
 * to give a task or event join semantics.
 *
 * Users should model a parallel joining gateway
 * to achieve the desired behavior.
 */
var fakeJoin = function() {

  function check(node, reporter) {

    if (!isAny$4(node, [
      'bpmn:Task',
      'bpmn:Event'
    ])) {
      return;
    }

    const incoming = node.incoming || [];

    if (incoming.length > 1) {
      reporter.report(node.id, translate('Incoming flows do not join'));
    }
  }

  return {
    check
  };

};

const {
  is: is$8,
  isAny: isAny$3
} = require$$0;


/**
 * A rule that checks the presence of a label.
 */
var labelRequired = function() {

  function check(node, reporter) {

    if (isAny$3(node, [
      'bpmn:ParallelGateway',
      'bpmn:EventBasedGateway'
    ])) {
      return;
    }

    // ignore joining gateways
    if (is$8(node, 'bpmn:Gateway') && !isForking(node)) {
      return;
    }

    if (is$8(node, 'bpmn:BoundaryEvent')) {
      return;
    }

    // ignore sub-processes
    if (is$8(node, 'bpmn:SubProcess')) {
      // TODO(nikku): better ignore expanded sub-processes only
      return;
    }

    // ignore sequence flow without condition
    if (is$8(node, 'bpmn:SequenceFlow') && !hasCondition$1(node)) {
      return;
    }

    // ignore data objects and artifacts for now
    if (isAny$3(node, [
      'bpmn:FlowNode',
      'bpmn:SequenceFlow',
      'bpmn:Participant',
      'bpmn:Lane'
    ])) {

      const name = (node.name || '').trim();

      if (name.length === 0) {
        reporter.report(node.id, translate('Element is missing label/name'));
      }
    }
  }

  return { check };
};


// helpers ////////////////////////

function isForking(node) {
  const outgoing = node.outgoing || [];

  return outgoing.length > 1;
}

function hasCondition$1(node) {
  return node.conditionExpression;
}

var helper = {};

const {
  is: is$7
} = require$$0;

/**
 * Create a checker that disallows the given element type.
 *
 * @param {String} type
 *
 * @return {Function} ruleImpl
 */
function disallowNodeType$2(type) {

  return function() {

    function check(node, reporter) {

      if (is$7(node, type)) {
        reporter.report(node.id, translate('Element has disallowed type <' + type + '>'));
      }
    }

    return {
      check
    };

  };

}

helper.disallowNodeType = disallowNodeType$2;

const disallowNodeType$1 = helper.disallowNodeType;

var noComplexGateway = disallowNodeType$1('bpmn:ComplexGateway');

const {
  isAny: isAny$2
} = require$$0;


/**
 * A rule that verifies that there exists no disconnected
 * flow elements, i.e. elements without incoming
 * _or_ outgoing sequence flows
 */
var noDisconnected = function() {

  function check(node, reporter) {

    if (!isAny$2(node, [
      'bpmn:Task',
      'bpmn:Gateway',
      'bpmn:SubProcess',
      'bpmn:Event'
    ]) || node.triggeredByEvent) {
      return;
    }

    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];

    if (!incoming.length && !outgoing.length) {
      reporter.report(node.id, translate('Element is not connected'));
    }
  }

  return {
    check
  };

};

const {
  is: is$6
} = require$$0;

/**
 * A rule that verifies that there are no disconnected
 * flow elements, i.e. elements without incoming
 * _or_ outgoing sequence flows
 */
var noDuplicateSequenceFlows = function() {

  const keyed = {};

  const outgoingReported = {};
  const incomingReported = {};

  function check(node, reporter) {

    if (!is$6(node, 'bpmn:SequenceFlow')) {
      return;
    }

    const key = flowKey(node);

    if (key in keyed) {
      reporter.report(node.id, translate('SequenceFlow is a duplicate'));

      const sourceId = node.sourceRef.id;
      const targetId = node.targetRef.id;

      console.log(sourceId, targetId);

      if (!outgoingReported[sourceId]) {
        reporter.report(sourceId, translate('Duplicate outgoing sequence flows'));

        outgoingReported[sourceId] = true;
      }

      if (!incomingReported[targetId]) {
        reporter.report(targetId, translate('Duplicate incoming sequence flows'));

        incomingReported[targetId] = true;
      }
    } else {
      keyed[key] = node;
    }
  }

  return {
    check
  };

};


// helpers /////////////////

function flowKey(flow) {
  const conditionExpression = flow.conditionExpression;

  const condition = conditionExpression ? conditionExpression.body : '';
  const source = flow.sourceRef ? flow.sourceRef.id : flow.id;
  const target = flow.targetRef ? flow.targetRef.id : flow.id;

  return source + '#' + target + '#' + condition;
}

const {
  is: is$5
} = require$$0;


/**
 * A rule that checks, whether a gateway forks and joins
 * at the same time.
 */
var noGatewayJoinFork = function() {

  function check(node, reporter) {

    if (!is$5(node, 'bpmn:Gateway')) {
      return;
    }

    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];

    if (incoming.length > 1 && outgoing.length > 1) {
      reporter.report(node.id, translate('Gateway forks and joins'));
    }
  }

  return {
    check
  };

};

const {
  isAny: isAny$1
} = require$$0;


/**
 * A rule that checks that no implicit split is modeled
 * starting from a task.
 *
 * users should model the parallel splitting gateway
 * explicitly instead.
 */
var noImplicitSplit = function() {

  function check(node, reporter) {

    if (!isAny$1(node, [
      'bpmn:Task',
      'bpmn:Event'
    ])) {
      return;
    }

    const outgoing = node.outgoing || [];

    const outgoingWithoutCondition = outgoing.filter((flow) => {
      return !hasCondition(flow) && !isDefaultFlow(node, flow);
    });

    if (outgoingWithoutCondition.length > 1) {
      reporter.report(node.id, translate('Flow splits implicitly'));
    }
  }

  return {
    check
  };

};


// helpers /////////////////////////////

function hasCondition(flow) {
  return !!flow.conditionExpression;
}

function isDefaultFlow(node, flow) {
  return node['default'] === flow;
}

const disallowNodeType = helper.disallowNodeType;

var noInclusiveGateway = disallowNodeType('bpmn:InclusiveGateway');

const {
  is: is$4
} = require$$0;

/**
 * A rule that checks whether not more than one blank start event
 * exists per scope.
 */
var singleBlankStartEvent = function() {

  function check(node, reporter) {

    if (!is$4(node, 'bpmn:FlowElementsContainer')) {
      return;
    }

    const flowElements = node.flowElements || [];

    const blankStartEvents = flowElements.filter(function(flowElement) {

      if (!is$4(flowElement, 'bpmn:StartEvent')) {
        return false;
      }

      const eventDefinitions = flowElement.eventDefinitions || [];

      return eventDefinitions.length === 0;
    });

    if (blankStartEvents.length > 1) {
      const type = is$4(node, 'bpmn:SubProcess') ? 'Sub process' : 'Process';

      reporter.report(node.id, translate(type) + translate(' has multiple blank start events'));
    }
  }

  return {
    check
  };

};

const {
  is: is$3
} = require$$0;


/**
 * A rule that verifies that an event contains maximum one event definition.
 */
var singleEventDefinition = function() {

  function check(node, reporter) {

    if (!is$3(node, 'bpmn:Event')) {
      return;
    }

    const eventDefinitions = node.eventDefinitions || [];

    if (eventDefinitions.length > 1) {
      reporter.report(node.id, translate('Event has multiple event definitions'));
    }
  }

  return {
    check
  };

};

const {
  is: is$2,
  isAny
} = require$$0;


/**
 * A rule that checks for the presence of a start event per scope.
 */
var startEventRequired = function() {

  function hasStartEvent(node) {
    const flowElements = node.flowElements || [];

    return (
      flowElements.some(node => is$2(node, 'bpmn:StartEvent'))
    );
  }

  function check(node, reporter) {

    if (!isAny(node, [
      'bpmn:Process',
      'bpmn:SubProcess'
    ])) {
      return;
    }

    if (!hasStartEvent(node)) {
      const type = is$2(node, 'bpmn:SubProcess') ? 'Sub process' : 'Process';

      reporter.report(node.id, translate(type) + translate(' is missing start event'));
    }
  }

  return { check };
};

const {
  is: is$1
} = require$$0;


/**
 * A rule that checks that start events inside a normal sub-processes
 * are blank (do not have an event definition).
 */
var subProcessBlankStartEvent = function() {

  function check(node, reporter) {

    if (!is$1(node, 'bpmn:SubProcess') || node.triggeredByEvent) {
      return;
    }

    const flowElements = node.flowElements || [];

    flowElements.forEach(function(flowElement) {

      if (!is$1(flowElement, 'bpmn:StartEvent')) {
        return false;
      }

      const eventDefinitions = flowElement.eventDefinitions || [];

      if (eventDefinitions.length > 0) {
        reporter.report(flowElement.id, translate('Start event must be blank'));
      }
    });
  }

  return {
    check
  };

};

const {
  is
} = require$$0;

/**
 * A rule that checks, whether a gateway has only one source and target.
 *
 * Those gateways are superfluous since they don't do anything.
 */
var superfluousGateway = function() {

  function check(node, reporter) {

    if (!is(node, 'bpmn:Gateway')) {
      return;
    }

    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];

    if (incoming.length === 1 && outgoing.length === 1) {
      reporter.report(node.id, translate('Gateway is superfluous. It only has one source and target.'));
    }
  }

  return {
    check
  };

};

var cache = {};

/**
 * A resolver that caches rules and configuration as part of the bundle,
 * making them accessible in the browser.
 *
 * @param {Object} cache
 */
function Resolver() {}

Resolver.prototype.resolveRule = function(pkg, ruleName) {

  const rule = cache[pkg + '/' + ruleName];

  if (!rule) {
    throw new Error('cannot resolve rule <' + pkg + '/' + ruleName + '>');
  }

  return rule;
};

Resolver.prototype.resolveConfig = function(pkg, configName) {
  throw new Error(
    'cannot resolve config <' + configName + '> in <' + pkg +'>'
  );
};

var resolver = new Resolver();

var rules = {
  "conditional-flows": "error",
  "end-event-required": "error",
  "event-sub-process-typed-start-event": "error",
  "fake-join": "warn",
  "label-required": "error",
  "no-complex-gateway": "error",
  "no-disconnected": "error",
  "no-duplicate-sequence-flows": "error",
  "no-gateway-join-fork": "error",
  "no-implicit-split": "error",
  "no-inclusive-gateway": "error",
  "single-blank-start-event": "error",
  "single-event-definition": "error",
  "start-event-required": "error",
  "sub-process-blank-start-event": "error",
  "superfluous-gateway": "warning"
};

var config = {
  rules: rules
};

var bundle = {
  resolver: resolver,
  config: config
};
cache['bpmnlint/conditional-flows'] = conditionalFlows;
cache['bpmnlint/end-event-required'] = endEventRequired;
cache['bpmnlint/event-sub-process-typed-start-event'] = eventSubProcessTypedStartEvent;
cache['bpmnlint/fake-join'] = fakeJoin;
cache['bpmnlint/label-required'] = labelRequired;
cache['bpmnlint/no-complex-gateway'] = noComplexGateway;
cache['bpmnlint/no-disconnected'] = noDisconnected;
cache['bpmnlint/no-duplicate-sequence-flows'] = noDuplicateSequenceFlows;
cache['bpmnlint/no-gateway-join-fork'] = noGatewayJoinFork;
cache['bpmnlint/no-implicit-split'] = noImplicitSplit;
cache['bpmnlint/no-inclusive-gateway'] = noInclusiveGateway;
cache['bpmnlint/single-blank-start-event'] = singleBlankStartEvent;
cache['bpmnlint/single-event-definition'] = singleEventDefinition;
cache['bpmnlint/start-event-required'] = startEventRequired;
cache['bpmnlint/sub-process-blank-start-event'] = subProcessBlankStartEvent;
cache['bpmnlint/superfluous-gateway'] = superfluousGateway;

export { config, bundle as default, resolver };
