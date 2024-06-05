import { MarkerType } from 'reactflow';

export const toProperCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
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
  const nodes = [];
  const edges = [];
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

  const nodeWidth = 250;
  let nodeHeight = 36;

  const edgeType = 'straight';

  const orderedSteps = steps.sort(dynamicSort('order'));
  for (let i = 0; i < orderedSteps.length; i++) {
    const def = orderedSteps[i];
    if (def.next_step_name !== undefined) {
      const label = toProperCase(def.next_step_name.replace(/_/g, ' '))
      const node = {
        id: `${i}`,
        data: {
          label: label
        },
        position: { x: nodeWidth, y: nodeHeight },
        style: {
          width: '275px'
        },
      };
      if (i + 1 < orderedSteps.length) {
        const edge = {
          id: `${i}_edge`,
          source: `${i}`,
          target: `${(i + 1)}`,
          type: edgeType,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          animate: true
        };
        edges.push(edge);
      }
      nodes.push(node);
      nodeHeight += 100;
    }
  }
  return [nodes, edges, nodes.concat(edges)];
};
