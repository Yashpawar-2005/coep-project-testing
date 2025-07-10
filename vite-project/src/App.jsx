import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from "reactflow";
import "reactflow/dist/style.css";

// Entity Node Component with enhanced styling
const EntityNode = ({ data, selected }) => {
  return (
    <div 
      className={`p-4 rounded-md shadow-lg ${
        selected 
          ? "ring-2 ring-blue-500 bg-blue-900" 
          : "bg-blue-800"
      } transition-all duration-200`}
    >
      <div className="border-b border-blue-500 pb-2 mb-2">
        <h3 className="text-lg font-bold text-white">{data.label}</h3>
      </div>
      <ul className="space-y-1">
        {data.attributes.map((attr, i) => (
          <li 
            key={i} 
            className="flex items-center text-sm"
          >
            <span 
              className={`mr-2 inline-block w-2 h-2 rounded-full ${
                attr.type === "PK" 
                  ? "bg-yellow-400" 
                  : attr.type === "FK" 
                    ? "bg-green-400" 
                    : "bg-gray-400"
              }`}
            />
            <span className="text-white">
              {attr.name} 
              <span className="text-blue-300 ml-1 text-xs">
                ({attr.type})
              </span>
            </span>
          </li>
        ))}
      </ul>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400" />
    </div>
  );
};

// Relationship Edge with enhanced styling
const RelationshipEdge = ({ id, source, target, label, ...props }) => {
  return (
    <div className="edge-label">
      <div className="px-2 py-1 bg-gray-800 rounded text-white text-xs font-bold">
        {label}
      </div>
    </div>
  );
};

// Entity Editor Component
const EntityEditor = ({ node, onUpdate, onClose }) => {
  const [entityName, setEntityName] = useState(node.data.label);
  const [attributes, setAttributes] = useState([...node.data.attributes]);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrType, setNewAttrType] = useState("string");

  const addAttribute = () => {
    if (newAttrName.trim() === "") return;
    
    setAttributes([
      ...attributes,
      { name: newAttrName, type: newAttrType }
    ]);
    setNewAttrName("");
  };

  const removeAttribute = (index) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  const handleSave = () => {
    onUpdate(node.id, {
      ...node.data,
      label: entityName,
      attributes: attributes,
    });
    onClose();
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-4 w-80 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Edit Entity</h3>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-1 text-sm">Entity Name</label>
        <input
          type="text"
          value={entityName}
          onChange={(e) => setEntityName(e.target.value)}
          className="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-1 text-sm">Attributes</label>
        <ul className="mb-2 max-h-40 overflow-y-auto">
          {attributes.map((attr, idx) => (
            <li key={idx} className="flex justify-between items-center mb-1 bg-gray-700 p-2 rounded">
              <span className="text-white text-sm">
                {attr.name} ({attr.type})
              </span>
              <button
                onClick={() => removeAttribute(idx)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            placeholder="Attribute name"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            className="flex-1 bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newAttrType}
            onChange={(e) => setNewAttrType(e.target.value)}
            className="bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="date">date</option>
            <option value="decimal">decimal</option>
            <option value="PK">PK</option>
            <option value="FK">FK</option>
          </select>
        </div>
        
        <button
          onClick={addAttribute}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2 rounded"
        >
          Add Attribute
        </button>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// Relationship Editor Component
const RelationshipEditor = ({ edge, onUpdate, onClose, nodes }) => {
  const [relationshipType, setRelationshipType] = useState(edge.label || "1:1");

  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  const handleSave = () => {
    onUpdate(edge.id, {
      ...edge,
      label: relationshipType,
    });
    onClose();
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-4 w-80 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Edit Relationship</h3>
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2 text-sm">
          From <span className="font-bold text-white">{sourceNode?.data.label}</span> to <span className="font-bold text-white">{targetNode?.data.label}</span>
        </p>
        
        <label className="block text-gray-300 mb-1 text-sm">Relationship Type</label>
        <select
          value={relationshipType}
          onChange={(e) => setRelationshipType(e.target.value)}
          className="w-full bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1:1">One to One (1:1)</option>
          <option value="1:M">One to Many (1:M)</option>
          <option value="M:1">Many to One (M:1)</option>
          <option value="M:N">Many to Many (M:N)</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function InteractiveERDiagram() {
  // Initial data
  const initialNodes = [
    { 
      id: "1", 
      type: "entityNode", 
      data: { 
        label: "Customers", 
        attributes: [
          { name: "customerID", type: "PK" }, 
          { name: "firstName", type: "string" }, 
          { name: "lastName", type: "string" },
          { name: "email", type: "string" },
          { name: "createdAt", type: "date" }
        ] 
      }, 
      position: { x: 100, y: 100 } 
    },
    { 
      id: "2", 
      type: "entityNode", 
      data: { 
        label: "Orders", 
        attributes: [
          { name: "orderID", type: "PK" }, 
          { name: "customerID", type: "FK" }, 
          { name: "orderDate", type: "date" },
          { name: "orderTotal", type: "decimal" },
          { name: "status", type: "string" }
        ] 
      }, 
      position: { x: 400, y: 100 } 
    },
    { 
      id: "3", 
      type: "entityNode", 
      data: { 
        label: "Products", 
        attributes: [
          { name: "productID", type: "PK" }, 
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "string" }, 
          { name: "price", type: "decimal" },
          { name: "stock", type: "number" }
        ] 
      }, 
      position: { x: 700, y: 100 } 
    },
    { 
      id: "4", 
      type: "entityNode", 
      data: { 
        label: "OrderItems", 
        attributes: [
          { name: "orderItemID", type: "PK" }, 
          { name: "orderID", type: "FK" }, 
          { name: "productID", type: "FK" },
          { name: "quantity", type: "number" },
          { name: "unitPrice", type: "decimal" }
        ] 
      }, 
      position: { x: 400, y: 300 } 
    }
  ];

  const initialEdges = [
    { id: "e1-2", source: "1", target: "2", type: "smoothstep", label: "1:M" },
    { id: "e2-4", source: "2", target: "4", type: "smoothstep", label: "1:M" },
    { id: "e3-4", source: "3", target: "4", type: "smoothstep", label: "1:M" }
  ];

  // State management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showEdgeEditor, setShowEdgeEditor] = useState(false);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [nodeCounter, setNodeCounter] = useState(initialNodes.length + 1);
  const [darkMode, setDarkMode] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");

  const reactFlowWrapper = useRef(null);
  const edgeUpdateSuccessful = useRef(true);

  // Connection handlers
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      label: '1:1',
      animated: false,
    }, eds));
  }, [setEdges]);

  // Element selection handlers
  const onSelectionChange = useCallback(({ nodes, edges }) => {
    if (nodes.length === 1) {
      setSelectedNode(nodes[0]);
      setSelectedEdge(null);
    } else if (edges.length === 1) {
      setSelectedEdge(edges[0]);
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, []);

  // Update node data
  const updateNodeData = (nodeId, newData) => {
    setNodes(nds => 
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: newData
          };
        }
        return node;
      })
    );
  };

  // Update edge data
  const updateEdgeData = (edgeId, newData) => {
    setEdges(eds => 
      eds.map(edge => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            ...newData
          };
        }
        return edge;
      })
    );
  };

  // Add new entity
  const addNewEntity = () => {
    const newNode = {
      id: `${nodeCounter}`,
      type: 'entityNode',
      data: {
        label: 'New Entity',
        attributes: [
          { name: 'id', type: 'PK' },
        ]
      },
      position: {
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300
      }
    };

    setNodes(nodes => [...nodes, newNode]);
    setNodeCounter(nodeCounter + 1);
  };

  // Delete selected element
  const deleteSelected = () => {
    if (selectedNode) {
      setNodes(nodes => nodes.filter(node => node.id !== selectedNode.id));
      setEdges(edges => edges.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
    
    if (selectedEdge) {
      setEdges(edges => edges.filter(edge => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  };

  // Export schema
  const handleExportSchema = () => {
    const schema = {
      entities: nodes.map(node => ({ 
        name: node.data.label, 
        attributes: node.data.attributes 
      })),
      relationships: edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        return {
          sourceEntity: sourceNode?.data.label,
          targetEntity: targetNode?.data.label,
          relationship: edge.label || "1:1"
        };
      })
    };

    if (exportFormat === "json") {
      const schemaJson = JSON.stringify(schema, null, 2);
      downloadFile("er_schema.json", schemaJson, "application/json");
    } else if (exportFormat === "sql") {
      const sqlCode = generateSQLSchema(schema);
      downloadFile("er_schema.sql", sqlCode, "text/plain");
    }
  };


  const generateSQLSchema = (schema) => {
    let sql = "-- Generated SQL Schema\n\n";
    schema.entities.forEach(entity => {
      sql += `CREATE TABLE ${entity.name} (\n`;
      
      const columns = entity.attributes.map(attr => {
        let column = `  ${attr.name} `;
        
        switch(attr.type) {
          case "PK":
            return `  ${attr.name} INT PRIMARY KEY AUTO_INCREMENT`;
          case "FK":
            return `  ${attr.name} INT`;
          case "string":
            return `  ${attr.name} VARCHAR(255)`;
          case "number":
            return `  ${attr.name} INT`;
          case "decimal":
            return `  ${attr.name} DECIMAL(10, 2)`;
          case "date":
            return `  ${attr.name} DATETIME`;
          case "boolean":
            return `  ${attr.name} BOOLEAN`;
          default:
            return `  ${attr.name} VARCHAR(255)`;
        }
      });
      
      sql += columns.join(",\n");
      sql += "\n);\n\n";
    });
    
    sql += "-- Foreign Key Constraints\n";
    schema.relationships.forEach(rel => {
      if (rel.relationship.includes("M")) {
        const manyEntity = rel.relationship.startsWith("M") ? rel.sourceEntity : rel.targetEntity;
        const oneEntity = rel.relationship.startsWith("M") ? rel.targetEntity : rel.sourceEntity;
        
        sql += `ALTER TABLE ${manyEntity} ADD FOREIGN KEY (${oneEntity.slice(0, -1)}ID) REFERENCES ${oneEntity}(${oneEntity.slice(0, -1)}ID);\n`;
      }
    });
    
    return sql;
  };

  
  const downloadFile = (filename, content, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
  };

  // Define node types
  const nodeTypes = { entityNode: EntityNode };

  // Get theme classes
  const getThemeClasses = () => {
    return darkMode 
      ? "bg-gray-900 text-white" 
      : "bg-white text-gray-800";
  };

  return (
    <div className={`h-screen w-full p-4 ${getThemeClasses()}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Enhanced ER Diagram Editor</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => setShowMiniMap(!showMiniMap)}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {showMiniMap ? "Hide" : "Show"} MiniMap
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 h-full">
        {/* Tools Panel */}
        <div className={`w-60 flex-shrink-0 p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"} h-full flex flex-col`}>
          <h2 className="text-lg font-semibold mb-4">Tools</h2>
          
          <div className="space-y-4 mb-auto">
            <button
              onClick={addNewEntity}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
            >
              Add New Entity
            </button>
            
            <button
              onClick={deleteSelected}
              className={`w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 ${
                !selectedNode && !selectedEdge ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!selectedNode && !selectedEdge}
            >
              Delete Selected
            </button>
            
            {selectedNode && (
              <button
                onClick={() => setShowNodeEditor(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Edit Selected Entity
              </button>
            )}
            
            {selectedEdge && (
              <button
                onClick={() => setShowEdgeEditor(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Edit Relationship
              </button>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Export Options</h3>
            <div className="mb-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className={`w-full p-2 rounded ${
                  darkMode ? "bg-gray-700" : "bg-white border border-gray-300"
                }`}
              >
                <option value="json">JSON Schema</option>
                <option value="sql">SQL Creation Script</option>
              </select>
            </div>
            <button
              onClick={handleExportSchema}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
            >
              Export Schema
            </button>
          </div>
          
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                <span>Primary Key (PK)</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                <span>Foreign Key (FK)</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                <span>Regular Attribute</span>
              </div>
            </div>
          </div>
        </div>
        
        
        <div 
          ref={reactFlowWrapper}
          className={`flex-1 rounded-lg overflow-hidden ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            fitView
            snapToGrid
            connectionLineStyle={{ stroke: "#3b82f6", strokeWidth: 2 }}
            defaultEdgeOptions={{
              style: { stroke: "#3b82f6", strokeWidth: 2 },
              type: 'smoothstep',
            }}
          >
            {showMiniMap && (
              <MiniMap
                nodeStrokeColor={darkMode ? "#fff" : "#000"}
                nodeColor={darkMode ? "#3b82f6" : "#3b82f6"}
                nodeBorderRadius={2}
              />
            )}
            <Controls />
            <Background
              color={darkMode ? "#4b5563" : "#e5e7eb"}
              gap={16}
              size={1}
            />
          </ReactFlow>
        </div>
      </div>
      
      {/* Entity Editor Modal */}
      {showNodeEditor && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EntityEditor
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setShowNodeEditor(false)}
          />
        </div>
      )}
      
      {/* Relationship Editor Modal */}
      {showEdgeEditor && selectedEdge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RelationshipEditor
            edge={selectedEdge}
            nodes={nodes}
            onUpdate={updateEdgeData}
            onClose={() => setShowEdgeEditor(false)}
          />
        </div>
      )}
    </div>
  );
}