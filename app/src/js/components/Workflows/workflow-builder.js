import React, { useState, useEffect, useContext } from 'react';
import FlowBuilder, { NodeContext, useAction } from 'react-flow-builder';
import Select from 'react-select';
import './index.css';

const InitNodeDisplay = () => {
  const node = useContext(NodeContext);
  return <div className="node init-node">{node.name}</div>;
};

const CloseNodeDisplay = () => {
  const node = useContext(NodeContext);
  return <div className="node close-node">{node.name}</div>;
};

const OtherNodeDisplay = () => {
    const node = useContext(NodeContext);
    const { removeNode } = useAction();
  
    return (
      <div className="node other-node">
        <div className="node-content">
          <span className="node-text">{node.name}</span>
          <button className="delete-button" onClick={() => removeNode(node)}>
            ✖
          </button>
        </div>
      </div>
    );
  };
  

const registerNodes = [
  {
    type: 'init',
    name: 'init',
    displayComponent: InitNodeDisplay,
    isStart: true,
  },
  {
    type: 'close',
    name: 'close',
    displayComponent: CloseNodeDisplay,
    isEnd: true,
  },
  {
    type: 'node',
    name: 'Other Node',
    displayComponent: OtherNodeDisplay,
  },
];

const Demo = ({ initialFlowData, initialNodeOptions }) => {
  const [nodes, setNodes] = useState([]);
  const [nodeOptions, setNodeOptions] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Initialize nodes and dropdown options
  useEffect(() => {
    if (initialFlowData) {
      const buildNodes = () => {
        const generatedNodes = [];
        let currentStep = 'init';

        while (currentStep && currentStep !== 'close') {
          const currentNode = initialFlowData[currentStep];
          if (!currentNode) break;

          generatedNodes.push({
            id: currentNode.step_id,
            type: currentNode.type === 'init' ? 'init' : 'node',
            name: currentStep,
          });

          currentStep = currentNode.next_step_name;
        }

        // Add the final 'close' node
        if (currentStep === 'close') {
          const closeNode = initialFlowData['close'];
          if (closeNode) {
            generatedNodes.push({
              id: closeNode.step_id,
              type: 'close',
              name: 'close',
            });
          }
        }

        return generatedNodes;
      };

      setNodes(buildNodes());
    }
  }, [initialFlowData]);

  // Update dropdown options dynamically based on nodes
  useEffect(() => {
    const usedStepNames = nodes.map((node) => node.name);
    const availableOptions = initialNodeOptions.filter(
      (option) => !usedStepNames.includes(option.step_name)
    );
    setNodeOptions(availableOptions);
  }, [nodes, initialNodeOptions]);

  // Add a new node
  const handleAddNode = () => {
    if (!selectedNode) return;

    const newNode = {
      id: selectedNode.step_id,
      type: 'node',
      name: selectedNode.step_name,
    };

    setNodes((prevNodes) => {
      const closeIndex = prevNodes.findIndex((node) => node.type === 'close');
      return [...prevNodes.slice(0, closeIndex), newNode, ...prevNodes.slice(closeIndex)];
    });

    setSelectedNode(null);
  };

  // Remove a node
  const handleRemoveNode = (nodeToRemove) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeToRemove.id));
  };

  // Save the flow
  const handleSaveFlow = () => {
    const flow = {};
    nodes.forEach((node, index) => {
      const nextNode = nodes[index + 1];
      const prevNode = nodes[index - 1];

      flow[node.name.toLowerCase().replace(/ /g, '_')] = {
        type: node.type,
        step_id: node.id,
        step_message: '',
        next_step_name: nextNode ? nextNode.name.toLowerCase().replace(/ /g, '_') : null,
        prev_step_name: prevNode ? prevNode.name.toLowerCase().replace(/ /g, '_') : null,
      };
    });

    console.log(JSON.stringify({ steps: flow }, null, 2));
  };

  return (
    <div className="flow-container">
      <div className="controls-container">
        <div className="dropdown-container">
          <Select
            options={nodeOptions.map((option) => ({
              value: option.step_id,
              label: option.step_name,
              ...option,
            }))}
            value={selectedNode}
            onChange={setSelectedNode}
            placeholder="Select a node to add"
          />
        </div>
        <button
          className="add-node-button"
          onClick={handleAddNode}
          disabled={!selectedNode}
        >
          Add Node
        </button>
        <button className="save-flow-button" onClick={handleSaveFlow}>
          Save Flow
        </button>
      </div>
      <FlowBuilder
        nodes={nodes.map((node) => ({
          ...node,
          className: `node ${node.type}-node`, // Add dynamic className
        }))}
        registerNodes={registerNodes}
        onChange={(updatedNodes) => setNodes(updatedNodes)}
        onNodeRemove={handleRemoveNode}
      />
    </div>
  );
};

export default Demo;
