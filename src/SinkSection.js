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
import SinkForm from './SinkForm'; // Assuming SinkForm is in the same directory

const SinkSection = ({ sinks, addSink, editSink, removeSink, getAvailableDatasets }) => {
  const [showAddSinkDialog, setShowAddSinkDialog] = useState(false);
  const [newSinkData, setNewSinkData] = useState(null);

  const [showEditSinkDialog, setShowEditSinkDialog] = useState(false);
  const [editingSinkData, setEditingSinkData] = useState(null);

  const openAddDialog = useCallback(() => {
    setNewSinkData({
      id: uuidv4(),
      name: `sink_${sinks.length + 1}`,
      type: "Parquet",
      input_dataset: "",
      config: {}
    });
    setShowAddSinkDialog(true);
  }, [sinks.length]);

  const closeAddDialog = useCallback(() => {
    setShowAddSinkDialog(false);
    setNewSinkData(null);
  }, []);

  const handleCreateSink = useCallback(() => {
    if (newSinkData) {
      addSink(newSinkData);
      closeAddDialog();
    }
  }, [addSink, newSinkData, closeAddDialog]);

  const openEditDialog = useCallback((sink) => {
    setEditingSinkData(JSON.parse(JSON.stringify(sink)));
    setShowEditSinkDialog(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setShowEditSinkDialog(false);
    setEditingSinkData(null);
  }, []);

  const handleSaveEditSink = useCallback(() => {
    if (editingSinkData) {
      editSink(editingSinkData);
      closeEditDialog();
    }
  }, [editSink, editingSinkData, closeEditDialog]);

  const handleEditingSinkChange = useCallback((field, value) => {
    setEditingSinkData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditingSinkConfigChange = useCallback((configField, value) => {
    setEditingSinkData(prev => ({
      ...prev,
      config: { ...prev.config, [configField]: value }
    }));
  }, []);

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>Define Data Output Destinations</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Specify where the final processed data will be written.</Typography>
      
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openAddDialog}
        sx={{ mb: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#4CAF50' } }}
      >
        Add New Data Output
      </Button>

      {sinks.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No outputs defined yet. Click "Add New Data Output" to begin.
        </Typography>
      )}

      {!getAvailableDatasets().length && sinks.length > 0 && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            No available input datasets from sources or transformations yet. Define sources/transformations first!
          </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {sinks.map((sink) => (
          <Card
            key={sink.id}
            sx={{ maxWidth: 350, width: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            onClick={() => openEditDialog(sink)}
          >
            <CardContent>
              <Typography variant="h6" component="div">
                Sink: {sink.name}
              </Typography>
              <Typography variant="body2" color='text.secondary' >
                Type: {sink.type}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton color="primary" onClick={(e) => { e.stopPropagation(); openEditDialog(sink); }} aria-label="edit sink">
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={(e) => { e.stopPropagation(); removeSink(sink.id); }} aria-label="remove sink">
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Add New Sink Dialog */}
      <Dialog open={showAddSinkDialog} onClose={closeAddDialog} fullWidth maxWidth="md">
        <DialogTitle>Add New Data Output</DialogTitle>
        <DialogContent dividers>
          {newSinkData && (
            <SinkForm
              sinkData={newSinkData}
              onInputChange={(field, value) => setNewSinkData(prev => ({ ...prev, [field]: value }))}
              onConfigChange={(configField, value) => setNewSinkData(prev => ({ ...prev, config: { ...prev.config, [configField]: value } }))}
              getAvailableDatasets={getAvailableDatasets}
              uniqueIdPrefix="new-sink"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button onClick={handleCreateSink} variant="contained">
            Create Sink
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Existing Sink Dialog */}
      <Dialog open={showEditSinkDialog} onClose={closeEditDialog} fullWidth maxWidth="md">
        <DialogTitle>Edit Data Sink: {editingSinkData?.name}</DialogTitle>
        <DialogContent dividers>
          {editingSinkData && (
            <SinkForm
              sinkData={editingSinkData}
              onInputChange={handleEditingSinkChange}
              onConfigChange={handleEditingSinkConfigChange}
              getAvailableDatasets={getAvailableDatasets}
              uniqueIdPrefix="edit-sink"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEditSink} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SinkSection;