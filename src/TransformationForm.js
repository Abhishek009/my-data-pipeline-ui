
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  TextField,
  Select,
  MenuItem,

  Typography,
  Box,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit'; // For the edit button on cards

import DataEditor from './DataEditor'; // Assuming you have a separate component for editing data

const TransformationForm = ({ transformData, onInputChange, onConfigChange, getAvailableDatasets, uniqueIdPrefix }) => (
  <Box>
    <TextField
      label="Transformation Name"
      variant="outlined"
      fullWidth
      size="small"
      value={transformData.name}
      onChange={(e) => onInputChange('name', e.target.value)}
      sx={{ mb: 2 }}
    />

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Input Dataset for this step</InputLabel>
      <Select
        value={transformData.input_dataset || ''}
        label="Input Dataset for this step"
        onChange={(e) => onInputChange('input_dataset', e.target.value)}
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
      value={transformData.output_dataset || ''}
      onChange={(e) => onInputChange('output_dataset', e.target.value)}
      sx={{ mb: 2 }}
    />
    {transformData.output_dataset && getAvailableDatasets().includes(transformData.output_dataset) && transformData.output_dataset !== transformData.input_dataset && (
        <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
          Output dataset name '{transformData.output_dataset}' already exists. Please choose a unique name.
        </Typography>
    )}

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Transformation Type</InputLabel>
      <Select
        value={transformData.type}
        label="Transformation Type"
        onChange={(e) => onInputChange('type', e.target.value)}
      >
        {["Filter Rows", "Select/Rename Columns", "Aggregate Data (Group By)", "Join Datasets", "Custom SQL"].map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>

    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Configuration Details</Typography>
    {transformData.type === "Filter Rows" && (
      <TextField
        label="Filter Condition"
        variant="outlined"
        fullWidth
        multiline
        rows={3}
        value={transformData.config.condition || ''}
        onChange={(e) => onConfigChange('condition', e.target.value)}
        placeholder="e.g., revenue > 1000 AND region = 'East' -- Spark SQL syntax"
        sx={{ mb: 2 }}
      />
    )}
    {transformData.type === "Select/Rename Columns" && (
      <>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Define columns to select and/or rename them. Leave 'New Name' empty to keep original.
        </Typography>
        <DataEditor
          data={transformData.config.columns || [{ original_name: '', new_name: '' }]}
          onChange={(newData) => onConfigChange('columns', newData)}
          columnConfig={{
            original_name: { type: 'text', title: 'Original Column Name' },
            new_name: { type: 'text', title: 'New Column Name (Optional)' }
          }}
          uniqueKeyPrefix={`${uniqueIdPrefix}-columns-${transformData.id}`}
        />
      </>
    )}
    {transformData.type === "Aggregate Data (Group By)" && (
      <>
        <TextField
          label="Group By Columns (comma-separated)"
          variant="outlined"
          fullWidth
          size="small"
          value={transformData.config.group_by || ''}
          onChange={(e) => onConfigChange('group_by', e.target.value)}
          placeholder="e.g., region, product_category"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Aggregation Operations"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={transformData.config.aggregations || ''}
          onChange={(e) => onConfigChange('aggregations', e.target.value)}
          placeholder="e.g., SUM(sales) as total_sales, COUNT(DISTINCT customer_id) as unique_customers"
          sx={{ mb: 2 }}
        />
      </>
    )}
    {transformData.type === "Join Datasets" && (
      <>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Right Dataset for Join</InputLabel>
          <Select
            value={transformData.config.right_dataset || ''}
            label="Right Dataset for Join"
            onChange={(e) => onConfigChange('right_dataset', e.target.value)}
          >
            <MenuItem value="">Select a dataset</MenuItem>
            {getAvailableDatasets().filter(d => d !== transformData.input_dataset).map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Join Type</InputLabel>
          <Select
            value={transformData.config.join_type || 'inner'}
            label="Join Type"
            onChange={(e) => onConfigChange('join_type', e.target.value)}
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
          value={transformData.config.join_condition || ''}
          onChange={(e) => onConfigChange('join_condition', e.target.value)}
          placeholder="e.g., left.product_id = right.id -- Spark SQL syntax, use `left.` and `right.` aliases"
          sx={{ mb: 2 }}
        />
      </>
    )}
    {transformData.type === "Custom SQL" && (
      <TextField
        label="Custom SQL Query"
        variant="outlined"
        fullWidth
        multiline
        rows={6}
        value={transformData.config.query || ''}
        onChange={(e) => onConfigChange('query', e.target.value)}
        placeholder="e.g., SELECT * FROM `{input_dataset}` JOIN `{right_dataset}` ON ..."
        sx={{ mb: 2 }}
      />
    )}
  </Box>
);

export default TransformationForm;