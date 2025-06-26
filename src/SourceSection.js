import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  Card, // Using Card for display
  CardContent,
  CardActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit'; // For the edit button on cards

import SourceForm from './SourceForm'; // Assuming you have a separate form component for sources

const SourceSection = ({ sources, addSource, editSource, removeSource, getAvailableDatasets }) => {
  const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
  const [newSourceData, setNewSourceData] = useState(null);

  const [showEditSourceDialog, setShowEditSourceDialog] = useState(false);
  const [editingSourceData, setEditingSourceData] = useState(null);

  const openAddDialog = useCallback(() => {
    setNewSourceData({
      id: uuidv4(),
      name: `source_${sources.length + 1}`,
      type: "CSV",
      schema: [{ column_name: '', data_type: 'string', nullable: true }],
      config: {}
    });
    setShowAddSourceDialog(true);
  }, [sources.length]);

  const closeAddDialog = useCallback(() => {
    setShowAddSourceDialog(false);
    setNewSourceData(null);
  }, []);

  const handleCreateSource = useCallback(() => {
    if (newSourceData) {
      addSource(newSourceData);
      closeAddDialog();
    }
  }, [addSource, newSourceData, closeAddDialog]);

  const openEditDialog = useCallback((source) => {
    setEditingSourceData(JSON.parse(JSON.stringify(source)));
    setShowEditSourceDialog(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setShowEditSourceDialog(false);
    setEditingSourceData(null);
  }, []);

  const handleSaveEditSource = useCallback(() => {
    if (editingSourceData) {
      editSource(editingSourceData);
      closeEditDialog();
    }
  }, [editSource, editingSourceData, closeEditDialog]);

  // Handler for changes within the Source EDITING dialog
  const handleEditingSourceChange = useCallback((field, value) => {
    setEditingSourceData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditingSourceConfigChange = useCallback((configField, value) => {
    setEditingSourceData(prev => ({
      ...prev,
      config: { ...prev.config, [configField]: value }
    }));
  }, []);

  const handleEditingSourceSchemaChange = useCallback((newSchema) => {
    setEditingSourceData(prev => ({ ...prev, schema: newSchema }));
  }, []);

  // This handles changes related to Database (SQL) source type for both new and edit dialogs.
  const handleTableQueryOptionChange = useCallback((currentData, setter, value) => {
    setter(prev => {
      const newConfig = { ...currentData.config };
      if (value === "Table Name") {
        delete newConfig.sql_query;
        newConfig.table_name = newConfig.table_name || "";
      } else {
        delete newConfig.table_name;
        newConfig.sql_query = newConfig.sql_query || "SELECT * FROM my_table";
      }
      return { ...prev, config: newConfig };
    });
  }, []);


  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>Define Data Input Sources</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add datasets your pipeline will read from. Each source needs a unique name.</Typography>
      
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openAddDialog}
        sx={{ mb: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#4CAF50' } }}
      >
        Add New Data Source
      </Button>

      {sources.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No sources defined yet. Click "Add New Data Source" to begin.
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {sources.map((source) => (
          <Card
            key={source.id}
            sx={{ maxWidth: 300, width: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            onClick={() => openEditDialog(source)}
          >
            <CardContent>
              {/* Updated Typography with noWrap for truncation */}
              <Typography variant="h6" component="div" noWrap>
                Source: {source.name}
              </Typography>
              <Typography variant="body2" color='text.secondary' noWrap>
                Type: {source.type}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton color="primary" onClick={(e) => { e.stopPropagation(); openEditDialog(source); }} aria-label="edit source">
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={(e) => { e.stopPropagation(); removeSource(source.id); }} aria-label="remove source">
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Add New Source Dialog */}
      <Dialog open={showAddSourceDialog} onClose={closeAddDialog} fullWidth maxWidth="md">
        <DialogTitle>Add New Data Source</DialogTitle>
        <DialogContent dividers>
          {newSourceData && (
            <SourceForm
              sourceData={newSourceData}
              onInputChange={(field, value) => setNewSourceData(prev => ({ ...prev, [field]: value }))}
              onConfigChange={(configField, value) => setNewSourceData(prev => ({ ...prev, config: { ...prev.config, [configField]: value } }))}
              onSchemaChange={(newData) => setNewSourceData(prev => ({ ...prev, schema: newData }))}
              onTableQueryOptionChange={(currentData, value) => handleTableQueryOptionChange(currentData, setNewSourceData, value)}
              uniqueIdPrefix="new-source"
              isNew={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button onClick={handleCreateSource} variant="contained">
            Create Source
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Existing Source Dialog */}
      <Dialog open={showEditSourceDialog} onClose={closeEditDialog} fullWidth maxWidth="md">
        <DialogTitle>Edit Data Source: {editingSourceData?.name}</DialogTitle>
        <DialogContent dividers>
          {editingSourceData && (
            <SourceForm
              sourceData={editingSourceData}
              onInputChange={handleEditingSourceChange}
              onConfigChange={handleEditingSourceConfigChange}
              onSchemaChange={handleEditingSourceSchemaChange}
              onTableQueryOptionChange={(currentData, value) => handleTableQueryOptionChange(currentData, setEditingSourceData, value)}
              uniqueIdPrefix="edit-source"
              isNew={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEditSource} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default SourceSection;
