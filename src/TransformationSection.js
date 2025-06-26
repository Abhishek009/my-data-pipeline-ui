import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  Button,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card, // Using Card for display
  CardContent,
  CardActions,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import EditIcon from '@mui/icons-material/Edit'; // For the edit button on cards
import TransformationForm from './TransformationForm'; // Assuming you have a separate form component for transformations
const TransformationSection = ({ transformations, addTransformation, editTransformation, removeTransformation, getAvailableDatasets }) => {
  const [showAddTransformationDialog, setShowAddTransformationDialog] = useState(false);
  const [newTransformationData, setNewTransformationData] = useState(null);

  const [showEditTransformationDialog, setShowEditTransformationDialog] = useState(false);
  const [editingTransformationData, setEditingTransformationData] = useState(null);

  const openAddDialog = useCallback(() => {
    setNewTransformationData({
      id: uuidv4(),
      name: `transform_${transformations.length + 1}`,
      type: "Filter Rows",
      input_dataset: "",
      output_dataset: "",
      config: {}
    });
    setShowAddTransformationDialog(true);
  }, [transformations.length]);

  const closeAddDialog = useCallback(() => {
    setShowAddTransformationDialog(false);
    setNewTransformationData(null);
  }, []);

  const handleCreateTransformation = useCallback(() => {
    if (newTransformationData) {
      addTransformation(newTransformationData);
      closeAddDialog();
    }
  }, [addTransformation, newTransformationData, closeAddDialog]);

  const openEditDialog = useCallback((transform) => {
    setEditingTransformationData(JSON.parse(JSON.stringify(transform)));
    setShowEditTransformationDialog(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setShowEditTransformationDialog(false);
    setEditingTransformationData(null);
  }, []);

  const handleSaveEditTransformation = useCallback(() => {
    if (editingTransformationData) {
      editTransformation(editingTransformationData);
      closeEditDialog();
    }
  }, [editTransformation, editingTransformationData, closeEditDialog]);

  const handleEditingTransformationChange = useCallback((field, value) => {
    setEditingTransformationData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditingTransformationConfigChange = useCallback((configField, value) => {
    setEditingTransformationData(prev => ({
      ...prev,
      config: { ...prev.config, [configField]: value }
    }));
  }, []);

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>Define Data Transformations</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add steps to clean, enrich, or reshape your data. Each transformation takes an input dataset and produces an output dataset.</Typography>
      
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openAddDialog}
        sx={{ mb: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#4CAF50' } }}
      >
        Add New Transformation Step
      </Button>

      {transformations.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No transformations defined yet. Click "Add New Transformation Step" to begin.
        </Typography>
      )}

      {!getAvailableDatasets().length && transformations.length > 0 && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            No available input datasets from sources yet. Define a source first!
          </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {transformations.map((transform) => (
          <Card
            key={transform.id}
            sx={{ maxWidth: 350, width: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
            onClick={() => openEditDialog(transform)}
          >
            <CardContent>
              <Typography variant="h6" component="div">
                Transformation: {transform.name}
              </Typography>
              <Typography variant="body2" color='text.secondary' >
                Type: {transform.type}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton color="primary" onClick={(e) => { e.stopPropagation(); openEditDialog(transform); }} aria-label="edit transformation">
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={(e) => { e.stopPropagation(); removeTransformation(transform.id); }} aria-label="remove transformation">
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Add New Transformation Dialog */}
      <Dialog open={showAddTransformationDialog} onClose={closeAddDialog} fullWidth maxWidth="md">
        <DialogTitle>Add New Transformation Step</DialogTitle>
        <DialogContent dividers>
          {newTransformationData && (
            <TransformationForm
              transformData={newTransformationData}
              onInputChange={(field, value) => setNewTransformationData(prev => ({ ...prev, [field]: value }))}
              onConfigChange={(configField, value) => setNewTransformationData(prev => ({ ...prev, config: { ...prev.config, [configField]: value } }))}
              getAvailableDatasets={getAvailableDatasets}
              uniqueIdPrefix="new-transform"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>Cancel</Button>
          <Button onClick={handleCreateTransformation} variant="contained">
            Create Transformation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Existing Transformation Dialog */}
      <Dialog open={showEditTransformationDialog} onClose={closeEditDialog} fullWidth maxWidth="md">
        <DialogTitle>Edit Transformation: {editingTransformationData?.name}</DialogTitle>
        <DialogContent dividers>
          {editingTransformationData && (
            <TransformationForm
              transformData={editingTransformationData}
              onInputChange={handleEditingTransformationChange}
              onConfigChange={handleEditingTransformationConfigChange}
              getAvailableDatasets={getAvailableDatasets}
              uniqueIdPrefix="edit-transform"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEditTransformation} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransformationSection;
