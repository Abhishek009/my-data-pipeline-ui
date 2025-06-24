import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Material-UI Imports
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Custom Data Editor Component using Material-UI
const DataEditor = ({ data, onChange, columnConfig, uniqueKeyPrefix }) => {
  const handleCellChange = (rowIndex, columnName, value) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [columnName]: value };
    onChange(newData);
  };

  const handleAddRow = () => {
    onChange([...data, { column_name: '', data_type: 'string', nullable: true }]);
  };

  const handleRemoveRow = (rowIndex) => {
    const newData = data.filter((_, i) => i !== rowIndex);
    onChange(newData);
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small" aria-label="data editor table">
          <TableHead>
            <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
              {Object.keys(columnConfig).map((key) => (
                <TableCell key={key} sx={{ fontWeight: 'bold' }}>{columnConfig[key].title}</TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={`${uniqueKeyPrefix}-row-${rowIndex}`}>
                {Object.keys(columnConfig).map((colKey) => (
                  <TableCell key={`${uniqueKeyPrefix}-cell-${rowIndex}-${colKey}`}>
                    {columnConfig[colKey] && columnConfig[colKey].type === 'text' && (
                      <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={row[colKey] || ''}
                        onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value)}
                      />
                    )}
                    {columnConfig[colKey] && columnConfig[colKey].type === 'selectbox' && (
                      <FormControl fullWidth size="small">
                        <Select
                          value={row[colKey] || ''}
                          onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value)}
                          displayEmpty
                        >
                          {columnConfig[colKey].options.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {columnConfig[colKey] && columnConfig[colKey].type === 'checkbox' && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={row[colKey] || false}
                            onChange={(e) => handleCellChange(rowIndex, colKey, e.target.checked)}
                          />
                        }
                        label="" // Label handled by TableHead
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveRow(rowIndex)}
                    aria-label="remove row"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddRow}
        sx={{ mt: 2 }}
      >
        Add Row
      </Button>
    </Box>
  );
};

// Main App Component
const App = () => {
  const [pipelineConfig, setPipelineConfig] = useState({
    pipeline_name: "My New Data Pipeline",
    description: "",
    sources: [],
    transformations: [],
    sinks: []
  });

  const [activeTab, setActiveTab] = useState(0); // 0 for sources, 1 for transformations, etc.
  const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
  const [currentDialogSourceData, setCurrentDialogSourceData] = useState(null);

  const getAvailableDatasets = () => {
    const datasets = [];
    pipelineConfig.sources.forEach(src => datasets.push(src.name));
    pipelineConfig.transformations.forEach(xform => {
      if (xform.output_dataset) datasets.push(xform.output_dataset);
    });
    return Array.from(new Set(datasets));
  };

  const handlePipelineConfigChange = (field, value) => {
    setPipelineConfig(prev => ({ ...prev, [field]: value }));
  };

  const openAddSourceDialog = () => {
    setCurrentDialogSourceData({
      id: uuidv4(),
      name: `source_${pipelineConfig.sources.length + 1}`,
      type: "CSV",
      schema: [{ column_name: '', data_type: 'string', nullable: true }],
      config: {},
      isExpanded: false
    });
    setShowAddSourceDialog(true);
  };

  const closeAddSourceDialog = () => {
    setShowAddSourceDialog(false);
    setCurrentDialogSourceData(null);
  };

  const createSourceFromDialog = (tempSource) => {
    setPipelineConfig(prev => ({
      ...prev,
      sources: [...prev.sources, tempSource]
    }));
    closeAddSourceDialog();
  };

  const removeSource = (idToRemove) => {
    setPipelineConfig(prev => ({
      ...prev,
      sources: prev.sources.filter(src => src.id !== idToRemove)
    }));
  };

  const toggleCardExpansion = (sectionType, id) => {
    setPipelineConfig(prev => ({
      ...prev,
      [sectionType]: prev[sectionType].map(item =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      )
    }));
  };

  const addTransformation = () => {
    setPipelineConfig(prev => ({
      ...prev,
      transformations: [...prev.transformations, {
        id: uuidv4(),
        name: `transform_${prev.transformations.length + 1}`,
        type: "Filter Rows",
        input_dataset: "",
        output_dataset: "",
        config: {},
        isExpanded: false
      }]
    }));
  };

  const removeTransformation = (idToRemove) => {
    setPipelineConfig(prev => ({
      ...prev,
      transformations: prev.transformations.filter(xform => xform.id !== idToRemove)
    }));
  };

  const addSink = () => {
    setPipelineConfig(prev => ({
      ...prev,
      sinks: [...prev.sinks, {
        id: uuidv4(),
        name: `sink_${prev.sinks.length + 1}`,
        type: "Parquet",
        input_dataset: "",
        config: {},
        isExpanded: false
      }]
    }));
  };

  const removeSink = (idToRemove) => {
    setPipelineConfig(prev => ({
      ...prev,
      sinks: prev.sinks.filter(sink => sink.id !== idToRemove)
    }));
  };

  const handleSectionInputChange = (sectionType, id, field, value) => {
    setPipelineConfig(prev => {
      const updatedSection = prev[sectionType].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      );
      return { ...prev, [sectionType]: updatedSection };
    });
  };

  const handleConfigChange = (sectionType, id, configField, value) => {
    setPipelineConfig(prev => {
      const updatedSection = prev[sectionType].map(item =>
        item.id === id ? { ...item, config: { ...item.config, [configField]: value } } : item
      );
      return { ...prev, [sectionType]: updatedSection };
    });
  };

  const handleSchemaChange = (sectionType, id, newSchema) => {
    setPipelineConfig(prev => {
      const updatedSection = prev[sectionType].map(item =>
        item.id === id ? { ...item, schema: newSchema } : item
      );
      return { ...prev, [sectionType]: updatedSection };
    });
  };

  const handleDialogSourceChange = (field, value) => {
    setCurrentDialogSourceData(prev => ({ ...prev, [field]: value }));
  };

  const handleDialogSourceConfigChange = (configField, value) => {
    setCurrentDialogSourceData(prev => ({
      ...prev,
      config: { ...prev.config, [configField]: value }
    }));
  };

  const handleDialogSourceSchemaChange = (newSchema) => {
    setCurrentDialogSourceData(prev => ({ ...prev, schema: newSchema }));
  };

  const handleDialogSourceTableQueryOptionChange = (id, value) => {
    setCurrentDialogSourceData(prev => {
      const newConfig = { ...prev.config };
      if (value === "Table Name") {
        delete newConfig.sql_query;
        newConfig.table_name = newConfig.table_name || "";
      } else {
        delete newConfig.table_name;
        newConfig.sql_query = newConfig.sql_query || "SELECT * FROM my_table";
      }
      return { ...prev, config: newConfig };
    });
  };

  const handleSectionTableQueryOptionChange = (sectionType, id, value) => {
    setPipelineConfig(prev => {
      const updatedSection = prev[sectionType].map(item => {
        if (item.id === id) {
          const newConfig = { ...item.config };
          if (value === "Table Name") {
            delete newConfig.sql_query;
            newConfig.table_name = newConfig.table_name || "";
          } else {
            delete newConfig.table_name;
            newConfig.sql_query = newConfig.sql_query || "SELECT * FROM my_table";
          }
          return { ...item, config: newConfig };
        }
        return item;
      });
      return { ...prev, [sectionType]: updatedSection };
    });
  };

  const simulateRunPipeline = () => {
    if (pipelineConfig.sources.length || pipelineConfig.transformations.length || pipelineConfig.sinks.length) {
      alert("Pipeline configuration submitted for simulated execution! Check console for JSON.");
      console.log("Simulated Backend Payload:", JSON.stringify(pipelineConfig, null, 2));
    } else {
      alert("Please define at least one source, transformation, or sink before running the pipeline.");
    }
  };

  const loadConfigFromFile = (e) => {
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
  };

  const downloadConfig = () => {
    const filename = `${pipelineConfig.pipeline_name.replace(/ /g, '_').toLowerCase() || 'pipeline'}.json`;
    const jsonStr = JSON.stringify(pipelineConfig, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Roboto, sans-serif' }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ color: '#333', mb: 4 }}>
        ⚡ SparkDataFlow Web UI (Material-UI)
      </Typography>
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
        Define your data pipeline by configuring sources, transformations, and outputs.
      </Typography>

      {/* Global Pipeline Metadata */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <TextField
          label="Pipeline Name"
          variant="outlined"
          fullWidth
          value={pipelineConfig.pipeline_name}
          onChange={(e) => handlePipelineConfigChange("pipeline_name", e.target.value)}
          sx={{ mb: 3 }}
        />
        <TextField
          label="Pipeline Description"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={pipelineConfig.description}
          onChange={(e) => handlePipelineConfigChange("description", e.target.value)}
        />
      </Paper>

      {/* Tabs */}
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
              color: '#555', // Default tab text color
              '&.Mui-selected': {
                color: '#1976d2', // Selected tab text color
                backgroundColor: '#e3f2fd', // Light blue background for selected tab
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

      {/* Tab Content */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: '0 0 8px 8px' }}>
        {activeTab === 0 && ( // Sources Tab
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>Define Data Input Sources</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add datasets your pipeline will read from. Each source needs a unique name.</Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openAddSourceDialog}
              sx={{ mb: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#4CAF50' } }}
            >
              Add New Data Source
            </Button>

            {pipelineConfig.sources.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No sources defined yet. Click "Add New Data Source" to begin.
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {pipelineConfig.sources.map((source) => (
                <Accordion
                  key={source.id}
                  expanded={source.isExpanded}
                  onChange={() => toggleCardExpansion('sources', source.id)}
                  sx={{ maxWidth: 350, width: '100%' }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${source.id}-content`}
                    id={`${source.id}-header`}
                  >
                    <Typography variant="h6">Source: {source.name} (Type: {source.type})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <IconButton color="error" onClick={() => removeSource(source.id)} aria-label="remove source">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <TextField
                      label="Dataset Name"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={source.name}
                      onChange={(e) => handleSectionInputChange('sources', source.id, 'name', e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Dataset Type</InputLabel>
                      <Select
                        value={source.type}
                        label="Dataset Type"
                        onChange={(e) => handleSectionInputChange('sources', source.id, 'type', e.target.value)}
                      >
                        {["CSV", "Parquet", "JSON", "Database (SQL)", "Delta Lake"].map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Configuration Details</Typography>
                    {source.type === "CSV" && (
                      <>
                        <TextField
                          label="File Path/URL"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={source.config.path || ''}
                          onChange={(e) => handleConfigChange('sources', source.id, 'path', e.target.value)}
                          placeholder="e.g., s3://my-bucket/data.csv"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Delimiter"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={source.config.delimiter || ','}
                          onChange={(e) => handleConfigChange('sources', source.id, 'delimiter', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={source.config.header || true}
                              onChange={(e) => handleConfigChange('sources', source.id, 'header', e.target.checked)}
                            />
                          }
                          label="Has Header Row?"
                          sx={{ mb: 1 }}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={source.config.infer_schema || true}
                              onChange={(e) => handleConfigChange('sources', source.id, 'infer_schema', e.target.checked)}
                            />
                          }
                          label="Infer Schema (recommended if no manual schema)"
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}
                    {(source.type === "Parquet" || source.type === "JSON" || source.type === "Delta Lake") && (
                      <TextField
                        label="Path/URL"
                        variant="outlined"
                        fullWidth
                        size="small"
                        value={source.config.path || ''}
                        onChange={(e) => handleConfigChange('sources', source.id, 'path', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    )}
                    {source.type === "Database (SQL)" && (
                      <>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Database Type</InputLabel>
                          <Select
                            value={source.config.db_type || 'PostgreSQL'}
                            label="Database Type"
                            onChange={(e) => handleConfigChange('sources', source.id, 'db_type', e.target.value)}
                          >
                            {["PostgreSQL", "MySQL", "SQL Server", "Oracle"].map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Host"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={source.config.host || ''}
                          onChange={(e) => handleConfigChange('sources', source.id, 'host', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Port"
                          variant="outlined"
                          fullWidth
                          size="small"
                          type="number"
                          value={source.config.port || 5432}
                          onChange={(e) => handleConfigChange('sources', source.id, 'port', parseInt(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Database Name"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={source.config.database || ''}
                          onChange={(e) => handleConfigChange('sources', source.id, 'database', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        
                        <FormControl component="fieldset" sx={{ mb: 2 }}>
                          <FormLabel component="legend">Data Source Option</FormLabel>
                          <RadioGroup
                            row
                            name={`source_db_option_${source.id}`}
                            value={source.config.table_name !== undefined ? "Table Name" : "Custom SQL Query"}
                            onChange={(e) => handleSectionTableQueryOptionChange('sources', source.id, e.target.value)}
                          >
                            <FormControlLabel value="Table Name" control={<Radio />} label="Table Name" />
                            <FormControlLabel value="Custom SQL Query" control={<Radio />} label="Custom SQL Query" />
                          </RadioGroup>
                        </FormControl>

                        {source.config.table_name !== undefined && (
                          <TextField
                            label="Table Name"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={source.config.table_name || ''}
                            onChange={(e) => handleConfigChange('sources', source.id, 'table_name', e.target.value)}
                            sx={{ mb: 2 }}
                          />
                        )}
                        {source.config.sql_query !== undefined && (
                          <TextField
                            label="Custom SQL Query"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={source.config.sql_query || ''}
                            onChange={(e) => handleConfigChange('sources', source.id, 'sql_query', e.target.value)}
                            placeholder="e.g., SELECT * FROM my_table"
                            sx={{ mb: 2 }}
                          />
                        )}

                        <TextField
                          label="Username"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={source.config.username || ''}
                          onChange={(e) => handleConfigChange('sources', source.id, 'username', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Password"
                          variant="outlined"
                          fullWidth
                          size="small"
                          type="password"
                          value={source.config.password || ''}
                          onChange={(e) => handleConfigChange('sources', source.id, 'password', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}

                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Schema Definition (Optional)</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Define column names and their types. If left empty and 'Infer Schema' is checked (for CSV), schema will be inferred.</Typography>
                    <DataEditor
                      data={source.schema || [{ column_name: '', data_type: 'string', nullable: true }]}
                      onChange={(newData) => handleSchemaChange('sources', source.id, newData)}
                      columnConfig={{
                        column_name: { type: 'text', title: 'Column Name' },
                        data_type: { type: 'selectbox', title: 'Data Type', options: ["string", "integer", "double", "boolean", "date", "timestamp"] },
                        nullable: { type: 'checkbox', title: 'Nullable' }
                      }}
                      uniqueKeyPrefix={`source-schema-${source.id}`}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 1 && ( // Transformations Tab
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>Define Data Transformations</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add steps to clean, enrich, or reshape your data. Each transformation takes an input dataset and produces an output dataset.</Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addTransformation}
              sx={{ mb: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#4CAF50' } }}
            >
              Add New Transformation Step
            </Button>

            {pipelineConfig.transformations.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No transformations defined yet. Click "Add New Transformation Step" to begin.
              </Typography>
            )}

            {!getAvailableDatasets().length && pipelineConfig.transformations.length > 0 && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  No available input datasets from sources yet. Define a source first!
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {pipelineConfig.transformations.map((transform) => (
                <Accordion
                  key={transform.id}
                  expanded={transform.isExpanded}
                  onChange={() => toggleCardExpansion('transformations', transform.id)}
                  sx={{ maxWidth: 350, width: '100%' }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${transform.id}-content`}
                    id={`${transform.id}-header`}
                  >
                    <Typography variant="h6">Transformation: {transform.name} (Type: {transform.type})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <IconButton color="error" onClick={() => removeTransformation(transform.id)} aria-label="remove transformation">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <TextField
                      label="Transformation Name"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={transform.name}
                      onChange={(e) => handleSectionInputChange('transformations', transform.id, 'name', e.target.value)}
                      sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Input Dataset for this step</InputLabel>
                      <Select
                        value={transform.input_dataset || ''}
                        label="Input Dataset for this step"
                        onChange={(e) => handleSectionInputChange('transformations', transform.id, 'input_dataset', e.target.value)}
                      >
                        <MenuItem value="">Select a dataset</MenuItem>
                        {getAvailableDatasets().map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label="Output Dataset Name for this step (Unique)"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={transform.output_dataset || ''}
                      onChange={(e) => handleSectionInputChange('transformations', transform.id, 'output_dataset', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    {transform.output_dataset && getAvailableDatasets().includes(transform.output_dataset) && transform.output_dataset !== transform.input_dataset && (
                        <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                          Output dataset name '{transform.output_dataset}' already exists. Please choose a unique name.
                        </Typography>
                    )}

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Transformation Type</InputLabel>
                      <Select
                        value={transform.type}
                        label="Transformation Type"
                        onChange={(e) => handleSectionInputChange('transformations', transform.id, 'type', e.target.value)}
                      >
                        {["Filter Rows", "Select/Rename Columns", "Aggregate Data (Group By)", "Join Datasets", "Custom SQL"].map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Configuration Details</Typography>
                    {transform.type === "Filter Rows" && (
                      <TextField
                        label="Filter Condition"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={transform.config.condition || ''}
                        onChange={(e) => handleConfigChange('transformations', transform.id, 'condition', e.target.value)}
                        placeholder="e.g., revenue > 1000 AND region = 'East' -- Spark SQL syntax"
                        sx={{ mb: 2 }}
                      />
                    )}
                    {transform.type === "Select/Rename Columns" && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Define columns to select and/or rename them. Leave 'New Name' empty to keep original.
                        </Typography>
                        <DataEditor
                          data={transform.config.columns || [{ original_name: '', new_name: '' }]}
                          onChange={(newData) => handleConfigChange('transformations', transform.id, 'columns', newData)}
                          columnConfig={{
                            original_name: { type: 'text', title: 'Original Column Name' },
                            new_name: { type: 'text', title: 'New Column Name (Optional)' }
                          }}
                          uniqueKeyPrefix={`transform-columns-${transform.id}`}
                        />
                      </>
                    )}
                    {transform.type === "Aggregate Data (Group By)" && (
                      <>
                        <TextField
                          label="Group By Columns (comma-separated)"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={transform.config.group_by || ''}
                          onChange={(e) => handleConfigChange('transformations', transform.id, 'group_by', e.target.value)}
                          placeholder="e.g., region, product_category"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Aggregation Operations"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={4}
                          value={transform.config.aggregations || ''}
                          onChange={(e) => handleConfigChange('transformations', transform.id, 'aggregations', e.target.value)}
                          placeholder="e.g., SUM(sales) as total_sales, COUNT(DISTINCT customer_id) as unique_customers"
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}
                    {transform.type === "Join Datasets" && (
                      <>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Right Dataset for Join</InputLabel>
                          <Select
                            value={transform.config.right_dataset || ''}
                            label="Right Dataset for Join"
                            onChange={(e) => handleConfigChange('transformations', transform.id, 'right_dataset', e.target.value)}
                          >
                            <MenuItem value="">Select a dataset</MenuItem>
                            {getAvailableDatasets().filter(d => d !== transform.input_dataset).map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Join Type</InputLabel>
                          <Select
                            value={transform.config.join_type || 'inner'}
                            label="Join Type"
                            onChange={(e) => handleConfigChange('transformations', transform.id, 'join_type', e.target.value)}
                          >
                            {["inner", "left", "right", "full"].map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Join Condition"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={3}
                          value={transform.config.join_condition || ''}
                          onChange={(e) => handleConfigChange('transformations', transform.id, 'join_condition', e.target.value)}
                          placeholder="e.g., left.product_id = right.id -- Spark SQL syntax, use `left.` and `right.` aliases"
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}
                    {transform.type === "Custom SQL" && (
                      <TextField
                        label="Custom SQL Query"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={6}
                        value={transform.config.query || ''}
                        onChange={(e) => handleConfigChange('transformations', transform.id, 'query', e.target.value)}
                        placeholder="e.g., SELECT * FROM `{input_dataset}` JOIN `{right_dataset}` ON ..."
                        sx={{ mb: 2 }}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 2 && ( // Sinks Tab
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>Define Data Output Destinations</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Specify where the final processed data will be written.</Typography>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addSink}
              sx={{ mb: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#4CAF50' } }}
            >
              Add New Data Output
            </Button>

            {pipelineConfig.sinks.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No outputs defined yet. Click "Add New Data Output" to begin.
              </Typography>
            )}

            {!getAvailableDatasets().length && pipelineConfig.sinks.length > 0 && (
                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                  No available input datasets from sources or transformations yet. Define sources/transformations first!
                </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {pipelineConfig.sinks.map((sink) => (
                <Accordion
                  key={sink.id}
                  expanded={sink.isExpanded}
                  onChange={() => toggleCardExpansion('sinks', sink.id)}
                  sx={{ maxWidth: 350, width: '100%' }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${sink.id}-content`}
                    id={`${sink.id}-header`}
                  >
                    <Typography variant="h6">Sink: {sink.name} (Type: {sink.type})</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <IconButton color="error" onClick={() => removeSink(sink.id)} aria-label="remove sink">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Dataset to write to this sink</InputLabel>
                      <Select
                        value={sink.input_dataset || ''}
                        label="Dataset to write to this sink"
                        onChange={(e) => handleSectionInputChange('sinks', sink.id, 'input_dataset', e.target.value)}
                      >
                        <MenuItem value="">Select a dataset</MenuItem>
                        {getAvailableDatasets().map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Output Type</InputLabel>
                      <Select
                        value={sink.type}
                        label="Output Type"
                        onChange={(e) => handleSectionInputChange('sinks', sink.id, 'type', e.target.value)}
                      >
                        {["Parquet", "CSV", "JSON", "Database (SQL)", "Delta Lake"].map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Configuration Details</Typography>
                    {(sink.type === "Parquet" || sink.type === "CSV" || sink.type === "JSON" || sink.type === "Delta Lake") && (
                      <>
                        <TextField
                          label="Output Directory/Path"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={sink.config.path || ''}
                          onChange={(e) => handleConfigChange('sinks', sink.id, 'path', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Write Mode</InputLabel>
                          <Select
                            value={sink.config.mode || 'overwrite'}
                            label="Write Mode"
                            onChange={(e) => handleConfigChange('sinks', sink.id, 'mode', e.target.value)}
                          >
                            {["overwrite", "append", "ignore", "errorIfExists"].map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Partition By Columns (comma-separated, optional)"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={sink.config.partition_by || ''}
                          onChange={(e) => handleConfigChange('sinks', sink.id, 'partition_by', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}
                    {sink.type === "Database (SQL)" && (
                      <>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Database Type</InputLabel>
                          <Select
                            value={sink.config.db_type || 'PostgreSQL'}
                            label="Database Type"
                            onChange={(e) => handleConfigChange('sinks', sink.id, 'db_type', e.target.value)}
                          >
                            {["PostgreSQL", "MySQL", "SQL Server", "Oracle"].map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Target Table Name"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={sink.config.table_name || ''}
                          onChange={(e) => handleConfigChange('sinks', sink.id, 'table_name', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Write Mode</InputLabel>
                          <Select
                            value={sink.config.mode || 'overwrite'}
                            label="Write Mode"
                            onChange={(e) => handleConfigChange('sinks', sink.id, 'mode', e.target.value)}
                          >
                            {["overwrite", "append", "ignore", "errorIfExists"].map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Username"
                          variant="outlined"
                          fullWidth
                          size="small"
                          value={sink.config.username || ''}
                          onChange={(e) => handleConfigChange('sinks', sink.id, 'username', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Password"
                          variant="outlined"
                          fullWidth
                          size="small"
                          type="password"
                          value={sink.config.password || ''}
                          onChange={(e) => handleConfigChange('sinks', sink.id, 'password', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        )}

        {activeTab === 3 && ( // Config Tab
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>Generated Pipeline Configuration (JSON)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>This is the JSON representation of your defined pipeline. You can copy this or download it to integrate with your backend.</Typography>
            <Paper elevation={1} sx={{ p: 2, backgroundColor: '#333', color: '#fff', overflowX: 'auto', mb: 3 }}>
              <pre>
                <code>{JSON.stringify(pipelineConfig, null, 2)}</code>
              </pre>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadConfig}
              >
                Download Configuration (JSON)
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => navigator.clipboard.writeText(JSON.stringify(pipelineConfig, null, 2))}
              >
                Copy to Clipboard
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Global Action Buttons */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={simulateRunPipeline}
          sx={{ backgroundColor: '#9C27B0', '&:hover': { backgroundColor: '#7B1FA2' } }}
        >
          Generate & Simulate Run Pipeline
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Upload Existing Configuration (JSON)</Typography>
          <Button
            variant="outlined"
            component="label" // Make the button act as a label for the file input
            startIcon={<UploadFileIcon />}
          >
            Upload File
            <input type="file" accept=".json" onChange={loadConfigFromFile} hidden />
          </Button>
        </Box>
      </Paper>

      {/* Add New Source Dialog */}
      <Dialog open={showAddSourceDialog} onClose={closeAddSourceDialog} fullWidth maxWidth="md">
        <DialogTitle>Add New Data Source</DialogTitle>
        <DialogContent dividers>
          {currentDialogSourceData && (
            <Box>
              <TextField
                label="Dataset Name (Unique ID for this source)"
                variant="outlined"
                fullWidth
                size="small"
                value={currentDialogSourceData.name}
                onChange={(e) => handleDialogSourceChange('name', e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Dataset Type</InputLabel>
                <Select
                  value={currentDialogSourceData.type}
                  label="Dataset Type"
                  onChange={(e) => handleDialogSourceChange('type', e.target.value)}
                >
                  {["CSV", "Parquet", "JSON", "Database (SQL)", "Delta Lake"].map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Configuration Details</Typography>
              {currentDialogSourceData.type === "CSV" && (
                <>
                  <TextField
                    label="File Path/URL"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={currentDialogSourceData.config.path || ''}
                    onChange={(e) => handleDialogSourceConfigChange('path', e.target.value)}
                    placeholder="e.g., s3://my-bucket/data.csv"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Delimiter"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={currentDialogSourceData.config.delimiter || ','}
                    onChange={(e) => handleDialogSourceConfigChange('delimiter', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentDialogSourceData.config.header || true}
                        onChange={(e) => handleDialogSourceConfigChange('header', e.target.checked)}
                      />
                    }
                    label="Has Header Row?"
                    sx={{ mb: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentDialogSourceData.config.infer_schema || true}
                        onChange={(e) => handleDialogSourceConfigChange('infer_schema', e.target.checked)}
                      />
                    }
                    label="Infer Schema (recommended if no manual schema)"
                    sx={{ mb: 2 }}
                  />
                </>
              )}
              {(currentDialogSourceData.type === "Parquet" || currentDialogSourceData.type === "JSON" || currentDialogSourceData.type === "Delta Lake") && (
                <TextField
                  label="Path/URL"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={currentDialogSourceData.config.path || ''}
                  onChange={(e) => handleDialogSourceConfigChange('path', e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}
              {currentDialogSourceData.type === "Database (SQL)" && (
                <>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Database Type</InputLabel>
                    <Select
                      value={currentDialogSourceData.config.db_type || 'PostgreSQL'}
                      label="Database Type"
                      onChange={(e) => handleDialogSourceConfigChange('db_type', e.target.value)}
                    >
                      {["PostgreSQL", "MySQL", "SQL Server", "Oracle"].map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Host"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={currentDialogSourceData.config.host || ''}
                    onChange={(e) => handleDialogSourceConfigChange('host', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Port"
                    variant="outlined"
                    fullWidth
                    size="small"
                    type="number"
                    value={currentDialogSourceData.config.port || 5432}
                    onChange={(e) => handleDialogSourceConfigChange('port', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Database Name"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={currentDialogSourceData.config.database || ''}
                    onChange={(e) => handleDialogSourceConfigChange('database', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Data Source Option</FormLabel>
                    <RadioGroup
                      row
                      name={`dialog_source_db_option_${currentDialogSourceData.id}`}
                      value={currentDialogSourceData.config.table_name !== undefined ? "Table Name" : "Custom SQL Query"}
                      onChange={(e) => handleDialogSourceTableQueryOptionChange(currentDialogSourceData.id, e.target.value)}
                    >
                      <FormControlLabel value="Table Name" control={<Radio />} label="Table Name" />
                      <FormControlLabel value="Custom SQL Query" control={<Radio />} label="Custom SQL Query" />
                    </RadioGroup>
                  </FormControl>

                  {currentDialogSourceData.config.table_name !== undefined && (
                    <TextField
                      label="Table Name"
                      variant="outlined"
                      fullWidth
                      size="small"
                      value={currentDialogSourceData.config.table_name || ''}
                      onChange={(e) => handleDialogSourceConfigChange('table_name', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  )}
                  {currentDialogSourceData.config.sql_query !== undefined && (
                    <TextField
                      label="Custom SQL Query"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      value={currentDialogSourceData.config.sql_query || ''}
                      onChange={(e) => handleDialogSourceConfigChange('sql_query', e.target.value)}
                      placeholder="e.g., SELECT * FROM my_table"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={currentDialogSourceData.config.username || ''}
                    onChange={(e) => handleDialogSourceConfigChange('username', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Password"
                    variant="outlined"
                    fullWidth
                    size="small"
                    type="password"
                    value={currentDialogSourceData.config.password || ''}
                    onChange={(e) => handleDialogSourceConfigChange('password', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Schema Definition (Optional)</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Define column names and their types. If left empty and 'Infer Schema' is checked (for CSV), schema will be inferred.</Typography>
              <DataEditor
                data={currentDialogSourceData.schema || [{ column_name: '', data_type: 'string', nullable: true }]}
                onChange={handleDialogSourceSchemaChange}
                columnConfig={{
                  column_name: { type: 'text', title: 'Column Name' },
                  data_type: { type: 'selectbox', title: 'Data Type', options: ["string", "integer", "double", "boolean", "date", "timestamp"] },
                  nullable: { type: 'checkbox', title: 'Nullable' }
                }}
                uniqueKeyPrefix={`dialog-schema-${currentDialogSourceData.id}`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddSourceDialog}>Cancel</Button>
          <Button onClick={() => currentDialogSourceData && createSourceFromDialog(currentDialogSourceData)} variant="contained">
            Create Source
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
