import dagre from 'dagre-d3';

export const toProperCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
};

export const draw = (graph, currentStep) => {
  const g = new dagre.graphlib.Graph({ compound: true })
    .setGraph({})
    .setDefaultEdgeLabel(() => ({}));

  const nodes = Object.values(graph);
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.def.next_step_name !== undefined) {
      let clss = [node.type, node.status].join(' ');
      if (currentStep !== undefined && node.def.next_step_name === currentStep) {
        clss = [node.type, node.status, 'current-step'].join(' ');
      }
      g.setNode(i, { label: toProperCase(node.def.next_step_name.replace(/_/g, ' ')), class: clss });
    }
  }
  g.nodes().forEach(function (v) {
    const node = g.node(v);
    node.rx = node.ry = 5;
  });

  for (let i = 0; i < (nodes.length - 1); i += 1) {
    g.setEdge(i, i + 1);
  }

  return g;
};

function dynamicSort (property) {
  let sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  };
}

export const workflowToGraph = (workflow) => {
  const graph = {};
  const steps = [];
  let nextStep = '';
  let cnt = 1;
  if (workflow) {
    const workflowSteps = workflow;
    for (const ea in workflowSteps) {
      const step = workflowSteps[ea];
      const type = workflowSteps[ea].type;
      if (type.match(/init/g)) {
        steps.push(Object.assign({ order: 1 }, step));
        nextStep = step.next_step_name;
        cnt++;
      } else if (!type.match(/close/g)) {
        for (const ea in workflowSteps) {
          const step = workflowSteps[ea];
          if (nextStep === ea) {
            steps.push(Object.assign({ order: cnt }, step));
            nextStep = step.next_step_name;
            break;
          }
        }
        cnt++;
      }
    }
  }
  const orderedSteps = steps.sort(dynamicSort('order'));
  for (const step in orderedSteps) {
    const id = orderedSteps[step].step_id;
    const def = orderedSteps[step];
    const node = {
      def
    };
    graph[id] = node;
  }
  return graph;
};
