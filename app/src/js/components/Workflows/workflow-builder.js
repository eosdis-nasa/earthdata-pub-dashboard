import React, { useState, useEffect, useContext } from "react";
import FlowBuilder, { NodeContext, useAction } from "react-flow-builder";
import Select from "react-select";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const InitNodeDisplay = () => {
  const node = useContext(NodeContext);
  return <div className="node init-node">{node.name}</div>;
};

const CloseNodeDisplay = () => {
  const node = useContext(NodeContext);
  return <div className="node close-node">{node.name}</div>;
};

const formatName = (name) =>
  name
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word

const Demo = ({ initialFlowData, initialNodeOptions, onSaveFlow }) => {
  const [nodes, setNodes] = useState([]);
  const [nodeOptions, setNodeOptions] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);

  // Metadata fields
  const [metadata, setMetadata] = useState({
    short_name: "",
    version: "",
    long_name: "",
    description: "",
  });

  useEffect(() => {
    handleSaveFlow();
  }, [nodes, metadata]);
  
  useEffect(() => {
    if (initialFlowData) {
      setMetadata({
        short_name: initialFlowData.short_name || "",
        version: initialFlowData.version || "",
        long_name: initialFlowData.long_name || "",
        description: initialFlowData.description || "",
        id: initialFlowData.id || "",
      });
      const buildNodes = () => {
        const generatedNodes = [];
        let currentStep = "init";
        const initialFlowDataSteps = initialFlowData.steps;
        while (currentStep && currentStep !== "close") {
          const currentNode = initialFlowDataSteps[currentStep];
          if (!currentNode) break;

          generatedNodes.push({
            ...currentNode,
            name: formatName(currentStep),
          });

          currentStep = currentNode.next_step_name;
        }

        if (currentStep === "close") {
          const closeNode = initialFlowDataSteps["close"];
          if (closeNode) {
            generatedNodes.push({
              ...closeNode,
              name: formatName("close"),
            });
          }
        }

        return generatedNodes;
      };

      setNodes(buildNodes());
    } else {
      setNodes([
        { step_id: "init", type: "init", name: formatName("init") },
        { step_id: "close", type: "close", name: formatName("close") },
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

    const newNodes = selectedNodes.map((selected) => {
      const fullNodeDetails = initialNodeOptions.find(
        (option) => option.step_id === selected.step_id
      );

      return {
        ...fullNodeDetails,
        name: formatName(fullNodeDetails.step_name),
      };
    });

    setNodes((prevNodes) => {
      const newNodesList = [...prevNodes];
      newNodesList.splice(selectedNodeIndex, 0, ...newNodes);
      return newNodesList;
    });

    setSelectedNodes([]);
    setPopupPosition({ top: 0, left: 0 });
    setDropdownVisible(false);
  };

  const handleSaveFlow = () => {
    const flow = {};

    nodes.forEach((node, index) => {
      const nextNode = nodes[index + 1];
      const prevNode = nodes[index - 1];

      const nodeData =
      initialFlowData?.steps?.[node.name.toLowerCase().replace(/ /g, "_")] ||
        initialNodeOptions.find(
          (option) =>
            option.step_name === node.name.toLowerCase().replace(/ /g, "_")
        ) ||
        {};

      const fullNode = { ...nodeData };

      if (fullNode.data) {
        fullNode.prev_step = { ...fullNode.data };
        delete fullNode.data;
      }

      fullNode.next_step_name = nextNode
        ? nextNode.name.toLowerCase().replace(/ /g, "_")
        : null;
      fullNode.prev_step_name = prevNode
        ? prevNode.name.toLowerCase().replace(/ /g, "_")
        : null;

      Object.keys(fullNode).forEach((key) => {
        if (fullNode[key] === null) {
          delete fullNode[key];
        }
      });

      flow[node.name.toLowerCase().replace(/ /g, "_")] = fullNode;
    });

    const finalOutput = {
      ...metadata,
      steps: flow,
    };
    onSaveFlow(JSON.stringify(finalOutput, null, 2));
  };

  return (
    <div className="flow-container">
      { 
        <div className="metadata-form">
          <label className='heading--small' htmlFor="Short Name">Short Name</label>
            <input
              type="text"
              value={metadata.short_name}
              onChange={(e) =>
                setMetadata({ ...metadata, short_name: e.target.value })
              }
            />
          <label className='heading--small'>Version </label>
            <input
              type="number"
              value={metadata.version}
              onChange={(e) =>
                setMetadata({ ...metadata, version: e.target.value })
              }
            />
         
          <label className='heading--small'>Long Name</label>
            <input
              type="text"
              value={metadata.long_name}
              onChange={(e) =>
                setMetadata({ ...metadata, long_name: e.target.value })
              }
            />
          
          <label className='heading--small'>Description</label>
            <textarea
              value={metadata.description}
              onChange={(e) =>
                setMetadata({ ...metadata, description: e.target.value })
              }
            />
        </div>
      }

      <div className="flow-builder-vertical">
        {nodes.map((node, index) => (
          <React.Fragment key={node.step_id}>
            <div className={`node-wrapper ${node.type}-wrapper`}>
              <div className={`node ${node.type}-node`}>
                <div className={node.type !== "init" && node.type !== "close" ? "node-text" : ""}>
                  {node.name}
                </div>
                {node.type !== "init" && node.type !== "close" && (
                  <button
                    className="delete-button"
                    onClick={() =>
                      setNodes((prev) =>
                        prev.filter((n) => n.step_id !== node.step_id)
                      )
                    }
                  >
                  <FontAwesomeIcon icon={faTimes} size="1x"/>
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
                      top: rect.top + window.scrollY - 10,
                      left: rect.left + window.scrollX,
                    });
                    setDropdownVisible(true);
                    setSelectedNodeIndex(index + 1);
                  }}
                >
                <FontAwesomeIcon icon={faPlus} />
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
            left: 210 + popupPosition.left,
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
          />
          <div className="popup-actions">
            <button
              className="add-node-button"
              onClick={handleAddNodesAtPosition}
            >
              Add Nodes
            </button>
            <button
              className="node close-node"
              onClick={() => setDropdownVisible(false)}
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
