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

const SinkForm = ({ sinkData, onInputChange, onConfigChange, getAvailableDatasets, uniqueIdPrefix }) => (
  <Box>
    <TextField
      label="Sink Name"
      variant="outlined"
      fullWidth
      size="small"
      value={sinkData.name}
      onChange={(e) => onInputChange('name', e.target.value)}
      sx={{ mb: 2 }}
    />

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Dataset to write to this sink</InputLabel>
      <Select
        value={sinkData.input_dataset || ''}
        label="Dataset to write to this sink"
        onChange={(e) => onInputChange('input_dataset', e.target.value)}
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
        value={sinkData.type}
        label="Output Type"
        onChange={(e) => onInputChange('type', e.target.value)}
      >
        {["Parquet", "CSV", "JSON", "Database (SQL)", "Delta Lake"].map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>

    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Configuration Details</Typography>
    {(sinkData.type === "Parquet" || sinkData.type === "CSV" || sinkData.type === "JSON" || sinkData.type === "Delta Lake") && (
      <>
        <TextField
          label="Output Directory/Path"
          variant="outlined"
          fullWidth
          size="small"
          value={sinkData.config.path || ''}
          onChange={(e) => onConfigChange('path', e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Write Mode</InputLabel>
          <Select
            value={sinkData.config.mode || 'overwrite'}
            label="Write Mode"
            onChange={(e) => onConfigChange('mode', e.target.value)}
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
          value={sinkData.config.partition_by || ''}
          onChange={(e) => onConfigChange('partition_by', e.target.value)}
          sx={{ mb: 2 }}
        />
      </>
    )}
    {sinkData.type === "Database (SQL)" && (
      <>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Database Type</InputLabel>
          <Select
            value={sinkData.config.db_type || 'PostgreSQL'}
            label="Database Type"
            onChange={(e) => onConfigChange('db_type', e.target.value)}
          >
            {["PostgreSQL", "MySQL", "SQL Server", "Oracle", "Hive"].map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* New field for Schema Name */}
        <TextField
          label="Schema Name (Optional)"
          variant="outlined"
          fullWidth
          size="small"
          value={sinkData.config.schema_name || ''}
          onChange={(e) => onConfigChange('schema_name', e.target.value)}
          sx={{ mb: 2 }}
          placeholder="e.g., public or default"
        />
        <TextField
          label="Target Table Name"
          variant="outlined"
          fullWidth
          size="small"
          value={sinkData.config.table_name || ''}
          onChange={(e) => onConfigChange('table_name', e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Write Mode</InputLabel>
          <Select
            value={sinkData.config.mode || 'overwrite'}
            label="Write Mode"
            onChange={(e) => onConfigChange('mode', e.target.value)}
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
          value={sinkData.config.username || ''}
          onChange={(e) => onConfigChange('username', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          size="small"
          type="password"
          value={sinkData.config.password || ''}
          onChange={(e) => onConfigChange('password', e.target.value)}
          sx={{ mb: 2 }}
        />
      </>
    )}
  </Box>
);

export default SinkForm;