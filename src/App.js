import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle, // Import Handle
  Position, // Import Position
} from 'reactflow';
import 'reactflow/dist/style.css';
// Removed: import yaml from 'js-yaml'; // No longer needed for frontend parsing

// Material-UI Imports
import { Box, Paper, Typography, Button, Grid } from '@mui/material';


// Define custom node styles for different types outside the component
const nodeStyles = {
  input: {
    backgroundColor: '#D1FAE5', // Green-ish
    color: '#065F46',
    border: '1px solid #34D399',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  transform: {
    backgroundColor: '#DBEAFE', // Blue-ish
    color: '#1E40AF',
    border: '1px solid #60A5FA',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  output: {
    backgroundColor: '#FFEDD5', // Orange-ish
    color: '#9A3412',
    border: '1px solid #FB923C',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

// Custom Input Node Component
const InputNode = ({ data }) => {
  return (
    <div style={nodeStyles.input}>
      <div>{data.label}</div>
      {/* Single source handle at the right */}
      <Handle type="source" position={Position.Right} id="outputHandle" style={{ background: '#555' }} />
    </div>
  );
};

// Custom Transform Node Component
const TransformNode = ({ data }) => {
  // data.tInputs is an array of input df-names for this transform
  // We create a target handle for each input
  return (
    <div style={nodeStyles.transform}>
      {/* Multiple target handles at the left for inputs, distributed vertically */}
      {data.tInputs && data.tInputs.map((inputDfName, index) => (
        <Handle
          key={`target-${inputDfName}`} // Unique key for React list rendering
          type="target"
          position={Position.Left}
          id={`target-${inputDfName}`} // Unique ID for each target handle
          // Distribute handles vertically
          style={{ background: '#555', top: `${(index + 1) * 100 / (data.tInputs.length + 1)}%` }}
        />
      ))}
      <div>{data.label}</div>
      {/* Single source handle at the right for output */}
      <Handle type="source" position={Position.Right} id="outputHandle" style={{ background: '#555' }} />
    </div>
  );
};

// Custom Output Node Component
const OutputNode = ({ data }) => {
  return (
    <div style={nodeStyles.output}>
      {/* Single target handle at the left */}
      <Handle type="target" position={Position.Left} id="inputHandle" style={{ background: '#555' }} />
      <div>{data.label}</div>
    </div>
  );
};

// Define nodeTypes object to map custom node names to components
const nodeTypes = {
  inputNode: InputNode,
  transformNode: TransformNode,
  outputNode: OutputNode,
};

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState(null);
  const [selectedNodeData, setSelectedNodeData] = useState(null); // State to store selected node data

  useEffect(() => {
    // Fetch the generated config when the component mounts
    fetch('/pipelineConfig.json') // This path is relative to where your React app is served
      .then(response => {
        if (!response.ok) {
          // If the file is not found (e.g., in dev mode without generated config),
          // or if there's an HTTP error, start with an empty pipeline.
          console.warn('pipelineConfig.json not found or could not be loaded. Starting with empty pipeline.');
          setError('Pipeline configuration not found. Please ensure the Scala generator has run and the JSON is in the correct location.');
          return { nodes: [], edges: [], pipelineMetadata: { name: 'New Pipeline', description: 'Start defining your pipeline here!' } };
        }
        return response.json();
      })
      .then(data => {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        // Assuming pipelineMetadata exists in the fetched JSON
        // If not, provide sensible defaults
        // Note: pipelineName and description are not directly used in the current UI,
        // but are kept for consistency with the Scala model.
        // You might want to display them somewhere like a header.
        // setPipelineName(data.pipelineMetadata?.name || 'New Pipeline');
        // setDescription(data.pipelineMetadata?.description || 'Start defining your pipeline here!');
        setError(null); // Clear any previous errors on successful load
      })
      .catch(error => {
        console.error('Failed to load pipelineConfig.json:', error);
        setError(`Failed to load pipeline configuration: ${error.message}. Please check server and file path.`);
        setNodes([]);
        setEdges([]);
      });
  }, []); // Empty dependency array means this runs once on mount


  // Handle node click to display details in the dedicated space
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeData(node);
  }, []);

  const renderInfoPanelContent = (node) => {
    if (!node || !node.data || !node.data.details) {
      return (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', width: '90%' }}>
          <Typography variant="h6" component="p" sx={{ mb: 1, color: 'inherit' }}>
            Select a Node for Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'inherit' }}>
            Click on any node in the diagram to view its details here.
          </Typography>
        </Box>
      );
    }

    const details = node.data.details;
    const type = node.type;
    const config = details.config || {}; // Get the config map, default to empty object if null

    // Prepare key-value pairs for grid display
    let infoRows = [];
    if (type === 'inputNode') {
      infoRows = [
        { label: 'Type', value: config.type }, // Access from config
        { label: 'Identifier', value: config.identifier }, // Access from config
        config.table && { label: 'Table', value: config.table },
        config.schema && { label: 'Schema', value: config.schema },
        config.format && { label: 'Format', value: config.format },
        config.path && { label: 'Path', value: config.path },
      ].filter(Boolean);
    } else if (type === 'transformNode') {
      infoRows = [
        { label: 'Input DFs', value: config['t_inputs'] }, // Access from config
        { label: 'Output DF', value: config.output }, // Access from config
      ].filter(Boolean);
    } else if (type === 'outputNode') {
      infoRows = [
        { label: 'Type', value: config.type }, // Access from config
        { label: 'Identifier', value: config.identifier }, // Access from config
        { label: 'Output Format', value: config.output_format }, // Access from config
        config.partition && { label: 'Partition', value: config.partition },
        config.schema && { label: 'Schema', value: config.schema },
        config.table && { label: 'Table', value: config.table },
        config.path && { label: 'Path', value: config.path },
      ].filter(Boolean);
    }

    return (
      <Box sx={{ p: 2, position: 'relative', width: '90%' }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.dark', textAlign: 'center' }}>
          {node.data.label.split('\n')[0]}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            gap: 2,
            alignItems: 'left',
            mb: 1,
            px: 1,
          }}
        >
          {infoRows.map((row, idx) => (
            <React.Fragment key={idx}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#0e7490',
                  textAlign: 'left',
                  pr: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                {row.label}:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#334155',
                  fontWeight: 500,
                  wordBreak: 'break-all',
                  background: '#f1f5f9',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                }}
              >
                {row.value}
              </Typography>
            </React.Fragment>
          ))}
        </Box>
        {/* Special handling for options/query as a code block */}
        {type === 'inputNode' && config.option && ( // Access from config
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            gap: 2,
            alignItems: 'left',
            mb: 1,
            px: 1,
          }}>
            <Typography variant="body2"
            sx={{ fontWeight: 600,
                  color: '#0e7490',
                  textAlign: 'left',
                  pr: 3,
                  whiteSpace: 'nowrap',}}>
              Options:
            </Typography>
            <Typography
              component="pre" variant="body2"
              sx={{
                bgcolor: '#f0fdfa',
                p: 1.5,
                borderRadius: 2,
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                border: '1px solid #bae6fd',
                mt: 0.5,
                boxShadow: 'inset 0 1px 3px rgba(6,182,212,0.08)',
                fontFamily: 'monospace',
                color: '#0e7490',

              }}
            >
              {config.option}
            </Typography>
          </Box>
        )}
        {type === 'transformNode' && config.query && ( // Access from config
          <Box sx={{ display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            gap: 4,
            alignItems: 'left',
            mb: 1,
            px: 1, }}>
            <Typography variant="body2" sx={{ fontWeight: 600,
                  color: '#0e7490',
                  textAlign: 'left',
                  pr: 3,
                  whiteSpace: 'nowrap', }}>
              Query:
            </Typography>
            <Typography
              component="pre"
              sx={{
                 bgcolor: '#f0fdfa',
                p: 1.5,
                borderRadius: 2,
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                border: '1px solid #bae6fd',
                mt: 0.5,
                boxShadow: 'inset 0 1px 3px rgba(6,182,212,0.08)',
                fontFamily: 'monospace',
                color: '#0e7490',
              }}
            >
              {config.query}
            </Typography>
          </Box>
        )}
        {type === 'outputNode' && config.option && ( // Access from config
          <Box sx={{ display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            gap: 6,
            alignItems: 'left',
            mb: 1,
            px: 1,}}>
            <Typography variant="body2" sx={{ fontWeight: 600,
                  color: '#0e7490',
                  textAlign: 'left',
                  pr: 3,
                  whiteSpace: 'nowrap', }}>
              Options:
            </Typography>
            <Typography
              component="pre"
              sx={{
                bgcolor: '#f0fdfa',
                p: 1.5,
                borderRadius: 2,
                fontSize: '0.85rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                border: '1px solid #bae6fd',
                mt: 0.5,
                boxShadow: 'inset 0 1px 3px rgba(6,182,212,0.08)',
                fontFamily: 'monospace',
                color: '#0e7490',
              }}
            >
              {config.option}
            </Typography>
          </Box>
        )}
      </Box>
    );


  };

 return (
     <div className="flex flex-col h-screen bg-gray-100 font-sans p-4  ">
       <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center w-full">Data Flow Diagram</h1>
       {/* Main container for ReactFlow and the info panel */}
       <div className="flex-grow flex flex-col bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '90vh' }}>
         {/* ReactFlow component fills most of the height */}
         <div className="flex-grow" style={{ height: 'calc(100% - 200px)' }}> {/* Fixed height for ReactFlow */}
           <ReactFlow
             nodes={nodes}
             edges={edges}
             onNodesChange={onNodesChange}
             onEdgesChange={onEdgesChange}
             //onConnect={onConnect}
             onNodeClick={onNodeClick}
             fitView
             className="rounded-lg"
             style={{ width: '100%', height: '100%' }}
             nodeTypes={nodeTypes}
           >
             <MiniMap />
             <Controls />
             <Background variant="dots" gap={12} size={1} />
           </ReactFlow>
         </div>




           <Paper
             elevation={16}
             sx={{
               width: 'auto',
               height: '220px',
               //background: 'linear-gradient(90deg,rgb(197, 215, 218) 0%,rgb(216, 230, 219) 100%)',
               borderRadius: '8px 8px 0 0',
               borderTop: '2px solid #06b6d4',
               boxShadow: '0 -8px 10px 0 rgba(6,182,212,0.18), 0 -1.5px 0 #06b6d4',
             display: 'flex',
               flexShrink: 0,
               overflowY: 'auto',
               alignItems: 'flex-start',
              position: 'relative',
              px: 4,
              py: 3,
              gap: 4,
              zIndex: 10,
              transition: 'box-shadow 0.2s',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 'auto',
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                height: '100%',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              {/* Close button */}
               {selectedNodeData && selectedNodeData.data && selectedNodeData.data.details && (
              <Button
                onClick={() => setSelectedNodeData(null)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  minWidth: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  color: '#06b6d4',
                  bgcolor: '#e0f7fa',
                  fontWeight: 'bold',
                  fontSize: 22,
                  boxShadow: '0 1px 4px rgba(6,182,212,0.12)',
                  '&:hover': { bgcolor: '#b2f5ea', color: '#0e7490' },
                }}
              >
                ×
              </Button>
               )}
              {/* Render the info panel content based on the selected node */}
              {renderInfoPanelContent(selectedNodeData)}
            </Box>
          </Paper>




      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
   );


};

export default App;
