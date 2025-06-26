import React, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs


// Material-UI Imports
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit'; // For the edit button on cards

import SinkSection from './SinkSection';
import SourceSection from './SourceSection';
import TransformationSection from './TransformationSection';
import PipelineMetadata from './PipelineMetadata';
import ConfigViewer from './ConfigViewer';
import GlobalActions from './GlobalActions';

const App = () => {
  const [pipelineConfig, setPipelineConfig] = useState({
    pipeline_name: "My New Data Pipeline",
    description: "",
    sources: [],
    transformations: [],
    sinks: []
  });

  const [activeTab, setActiveTab] = useState(0);
  
  // Utility function to get available datasets
  const getAvailableDatasets = useCallback(() => {
    const datasets = [];
    pipelineConfig.sources.forEach(src => datasets.push(src.name));
    pipelineConfig.transformations.forEach(xform => {
      if (xform.output_dataset) datasets.push(xform.output_dataset);
    });
    return Array.from(new Set(datasets));
  }, [pipelineConfig.sources, pipelineConfig.transformations]);


  // --- CRUD Operations for Sources, Transformations, Sinks ---
  const addSource = useCallback((newSource) => {
    setPipelineConfig(prev => ({
      ...prev,
      sources: [...prev.sources, newSource]
    }));
  }, []);

  const editSource = useCallback((updatedSource) => {
    setPipelineConfig(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === updatedSource.id ? updatedSource : s)
    }));
  }, []);

  const removeSource = useCallback((idToRemove) => {
    setPipelineConfig(prev => ({
      ...prev,
      sources: prev.sources.filter(src => src.id !== idToRemove)
    }));
  }, []);

  const addTransformation = useCallback((newTransform) => {
    setPipelineConfig(prev => ({
      ...prev,
      transformations: [...prev.transformations, newTransform]
    }));
  }, []);

  const editTransformation = useCallback((updatedTransform) => {
    setPipelineConfig(prev => ({
      ...prev,
      transformations: prev.transformations.map(t => t.id === updatedTransform.id ? updatedTransform : t)
    }));
  }, []);

  const removeTransformation = useCallback((idToRemove) => {
    setPipelineConfig(prev => ({
      ...prev,
      transformations: prev.transformations.filter(xform => xform.id !== idToRemove)
    }));
  }, []);

  const addSink = useCallback((newSink) => {
    setPipelineConfig(prev => ({
      ...prev,
      sinks: [...prev.sinks, newSink]
    }));
  }, []);

  const editSink = useCallback((updatedSink) => {
    setPipelineConfig(prev => ({
      ...prev,
      sinks: prev.sinks.map(s => s.id === updatedSink.id ? updatedSink : s)
    }));
  }, []);

  const removeSink = useCallback((idToRemove) => {
    setPipelineConfig(prev => ({
      ...prev,
      sinks: prev.sinks.filter(sink => sink.id !== idToRemove)
    }));
  }, []);


  const simulateRunPipeline = useCallback(() => {
    if (pipelineConfig.sources.length || pipelineConfig.transformations.length || pipelineConfig.sinks.length) {
      alert("Pipeline configuration submitted for simulated execution! Check console for JSON.");
      console.log("Simulated Backend Payload:", JSON.stringify(pipelineConfig, null, 2));
    } else {
      alert("Please define at least one source, transformation, or sink before running the pipeline.");
    }
  }, [pipelineConfig]);

  const loadConfigFromFile = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const uploadedData = JSON.parse(event.target.result);
          if (uploadedData.pipeline_name !== undefined && uploadedData.sources !== undefined &&
              uploadedData.transformations !== undefined && uploadedData.sinks !== undefined) {
            setPipelineConfig(uploadedData);
            alert("Pipeline configuration loaded successfully!");
          } else {
            alert("Invalid JSON configuration. Missing expected keys.");
          }
        } catch (error) {
          alert("Invalid JSON file. Please upload a valid JSON.");
          console.error("Error loading JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const downloadConfig = useCallback(() => {
    const filename = `${pipelineConfig.pipeline_name.replace(/ /g, '_').toLowerCase() || 'pipeline'}.json`;
    const jsonStr = JSON.stringify(pipelineConfig, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pipelineConfig]);

  return (
    <Box sx={{ p: 2, backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ color: '#333', mb: 4 }}>
       SparkDataFlow Web UI
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Define your data pipeline by configuring sources, transformations, and outputs.
      </Typography>

      <PipelineMetadata
        pipelineName={pipelineConfig.pipeline_name}
        description={pipelineConfig.description}
        onNameChange={(value) => setPipelineConfig(prev => ({ ...prev, pipeline_name: value }))}
        onDescriptionChange={(value) => setPipelineConfig(prev => ({ ...prev, description: value }))}
      />

      <Paper elevation={3} sx={{ borderRadius: '8px 8px 0 0', overflow: 'hidden', mb: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          aria-label="pipeline sections tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#1976d2' },
            '& .MuiTab-root': {
              color: '#555',
              '&.Mui-selected': {
                color: '#1976d2',
                backgroundColor: '#e3f2fd',
              },
            },
          }}
        >
          <Tab label="Sources" />
          <Tab label="Transformations" />
          <Tab label="Sinks" />
          <Tab label="Config" />
        </Tabs>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, borderRadius: '0 0 8px 8px' }}>
        {activeTab === 0 && (
          <SourceSection
            sources={pipelineConfig.sources}
            addSource={addSource}
            editSource={editSource}
            removeSource={removeSource}
            getAvailableDatasets={getAvailableDatasets}
          />
        )}

        {activeTab === 1 && (
          <TransformationSection
            transformations={pipelineConfig.transformations}
            addTransformation={addTransformation}
            editTransformation={editTransformation}
            removeTransformation={removeTransformation}
            getAvailableDatasets={getAvailableDatasets}
          />
        )}

        {activeTab === 2 && (
          <SinkSection
            sinks={pipelineConfig.sinks}
            addSink={addSink}
            editSink={editSink}
            removeSink={removeSink}
            getAvailableDatasets={getAvailableDatasets}
          />
        )}

        {activeTab === 3 && (
          <ConfigViewer
            pipelineConfig={pipelineConfig}
            downloadConfig={downloadConfig}
          />
        )}
      </Paper>

      <GlobalActions
        simulateRunPipeline={simulateRunPipeline}
        loadConfigFromFile={loadConfigFromFile}
      />
    </Box>
  );
};

export default App;
