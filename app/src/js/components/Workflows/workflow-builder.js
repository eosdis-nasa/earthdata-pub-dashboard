import React, { useState, useEffect, useContext } from "react";
import FlowBuilder, { NodeContext, useAction } from "react-flow-builder";
import Select from "react-select";
import "./index.css";

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
        <button
          className="delete-button"
          onClick={() => removeNode(node)}
          title="Remove Node"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

const registerNodes = [
  {
    type: "init",
    name: "init",
    displayComponent: InitNodeDisplay,
    isStart: true,
  },
  {
    type: "close",
    name: "close",
    displayComponent: CloseNodeDisplay,
    isEnd: true,
  },
  {
    type: "node",
    name: "Other Node",
    displayComponent: OtherNodeDisplay,
  },
];

// Utility function to format names
const formatName = (name) =>
  name
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word

const Demo = ({ initialFlowData, initialNodeOptions }) => {
  const [nodes, setNodes] = useState([]);
  const [nodeOptions, setNodeOptions] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);

  useEffect(() => {
    if (initialFlowData) {
      const buildNodes = () => {
        const generatedNodes = [];
        let currentStep = "init";

        while (currentStep && currentStep !== "close") {
          const currentNode = initialFlowData[currentStep];
          if (!currentNode) break;

          generatedNodes.push({
            id: currentNode.step_id,
            type: currentNode.type === "init" ? "init" : "node",
            name: formatName(currentStep),
          });

          currentStep = currentNode.next_step_name;
        }

        if (currentStep === "close") {
          const closeNode = initialFlowData["close"];
          if (closeNode) {
            generatedNodes.push({
              id: closeNode.step_id,
              type: "close",
              name: formatName("close"),
            });
          }
        }

        return generatedNodes;
      };

      setNodes(buildNodes());
    } else {
      setNodes([
        { id: "init", type: "init", name: formatName("init") },
        { id: "close", type: "close", name: formatName("close") },
      ]);
    }
  }, [initialFlowData]);

  useEffect(() => {
    const usedStepNames = nodes.map((node) =>
      node.name.toLowerCase().replace(/ /g, "_")
    );
    const availableOptions = initialNodeOptions.filter(
      (option) => !usedStepNames.includes(option.step_name)
    );
    setNodeOptions(availableOptions);
  }, [nodes, initialNodeOptions]);

  const handleAddNodesAtPosition = () => {
    if (!selectedNodes.length || selectedNodeIndex === null) return;

    const newNodes = selectedNodes.map((selected) => ({
      id: selected.step_id,
      type: "node",
      name: formatName(selected.step_name),
    }));

    setNodes((prevNodes) => {
      const newNodesList = [...prevNodes];
      newNodesList.splice(selectedNodeIndex, 0, ...newNodes);
      return newNodesList;
    });

    setSelectedNodes([]);
    setPopupPosition({ top: 0, left: 0 });
    setDropdownVisible(false);
  };

  const handleRemoveNode = (nodeToRemove) => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeToRemove.id));
    const removedOption = initialNodeOptions.find(
      (option) => option.step_name === nodeToRemove.name.toLowerCase().replace(/ /g, "_")
    );
    if (removedOption) {
      setNodeOptions((prevOptions) => [...prevOptions, removedOption]);
    }
  };

  const handleSaveFlow = () => {
    const flow = {};
    nodes.forEach((node, index) => {
      const nextNode = nodes[index + 1];
      const prevNode = nodes[index - 1];

      flow[node.name.toLowerCase().replace(/ /g, "_")] = {
        type: node.type,
        step_id: node.id,
        step_message: "",
        next_step_name: nextNode
          ? nextNode.name.toLowerCase().replace(/ /g, "_")
          : null,
        prev_step_name: prevNode
          ? prevNode.name.toLowerCase().replace(/ /g, "_")
          : null,
      };
    });

    console.log(JSON.stringify({ steps: flow }, null, 2));
  };

  return (
    <div className="flow-container">
      <div className="controls-container">
        <button className="save-flow-button" onClick={handleSaveFlow}>
          Save Flow
        </button>
      </div>
      <div className="flow-builder-vertical">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div className={`node-wrapper ${node.type}-wrapper`}>
              <div className={`node ${node.type}-node`}>
                <div className={node.type === "node"?"node-text":""}>{node.name}</div>
                {node.type === "node" && (
                  <button
                    className="delete-button"
                    onClick={() => handleRemoveNode(node)}
                  >
                    ✖
                  </button>
                )}
              </div>
            </div>
            {node.type !== "close" && (
              <div className="edge-container">
                <div className="edge-line"></div>
                <button
                  className="insert-button"
                  onClick={(e) => {
                    const rect = e.target.getBoundingClientRect();
                    setPopupPosition({
                      top: rect.top + window.scrollY + 30,
                      left: rect.left + window.scrollX - 50,
                    });
                    setDropdownVisible(true);
                    setSelectedNodeIndex(index + 1);
                  }}
                >
                  ➕
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {dropdownVisible && (
        <div
          className="popup-container"
          style={{
            position: "absolute",
            top: popupPosition.top,
            left: popupPosition.left,
            zIndex: 1000,
            backgroundColor: "#fff",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Select
            isMulti
            options={nodeOptions.map((option) => ({
              value: option.step_id,
              label: formatName(option.step_name),
              ...option,
            }))}
            value={selectedNodes}
            onChange={setSelectedNodes}
            placeholder="Select nodes to add"
          />
          <div className="popup-actions">
            <button
              className="add-node-button"
              onClick={handleAddNodesAtPosition}
              disabled={!selectedNodes.length || selectedNodeIndex === null}
            >
              Add Nodes
            </button>
            <button
              className="node close-node"
              onClick={() => {
                setPopupPosition({ top: 0, left: 0 });
                setDropdownVisible(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo;
