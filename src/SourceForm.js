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
import DataEditor from './DataEditor';
const SourceForm = ({ sourceData, onInputChange, onConfigChange, onSchemaChange, onTableQueryOptionChange, uniqueIdPrefix, isNew }) => (
  <Box>
    <TextField
      label="Dataset Name (Unique ID for this source)"
      variant="outlined"
      fullWidth
      size="small"
      value={sourceData.name}
      onChange={(e) => onInputChange('name', e.target.value)}
      sx={{ mb: 2 }}
    />

    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel>Dataset Type</InputLabel>
      <Select
        value={sourceData.type}
        label="Dataset Type"
        onChange={(e) => onInputChange('type', e.target.value)}
      >
        {["CSV", "Parquet", "JSON", "Database (SQL)", "Delta Lake"].map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>

    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Configuration Details</Typography>
    {sourceData.type === "CSV" && (
      <>
        <TextField
          label="File Path/URL"
          variant="outlined"
          fullWidth
          size="small"
          value={sourceData.config.path || ''}
          onChange={(e) => onConfigChange('path', e.target.value)}
          placeholder="e.g., s3://my-bucket/data.csv"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Delimiter"
          variant="outlined"
          fullWidth
          size="small"
          value={sourceData.config.delimiter || ','}
          onChange={(e) => onConfigChange('delimiter', e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={sourceData.config.header || true}
              onChange={(e) => onConfigChange('header', e.target.checked)}
            />
          }
          label="Has Header Row?"
          sx={{ mb: 1 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={sourceData.config.infer_schema || true}
              onChange={(e) => onConfigChange('infer_schema', e.target.checked)}
            />
          }
          label="Infer Schema (recommended if no manual schema)"
          sx={{ mb: 2 }}
        />
      </>
    )}
    {(sourceData.type === "Parquet" || sourceData.type === "JSON" || sourceData.type === "Delta Lake") && (
      <TextField
        label="Path/URL"
        variant="outlined"
        fullWidth
        size="small"
        value={sourceData.config.path || ''}
        onChange={(e) => onConfigChange('path', e.target.value)}
        sx={{ mb: 2 }}
      />
    )}
    {sourceData.type === "Database (SQL)" && (
      <>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Database Type</InputLabel>
          <Select
            value={sourceData.config.db_type || 'PostgreSQL'}
            label="Database Type"
            onChange={(e) => onConfigChange('db_type', e.target.value)}
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
          value={sourceData.config.host || ''}
          onChange={(e) => onConfigChange('host', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Port"
          variant="outlined"
          fullWidth
          size="small"
          type="number"
          value={sourceData.config.port || 5432}
          onChange={(e) => onConfigChange('port', parseInt(e.target.value))}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Database Name"
          variant="outlined"
          fullWidth
          size="small"
          value={sourceData.config.database || ''}
          onChange={(e) => onConfigChange('database', e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Data Source Option</FormLabel>
          <RadioGroup
            row
            name={`${uniqueIdPrefix}_db_option_${sourceData.id}`}
            value={sourceData.config.table_name !== undefined ? "Table Name" : "Custom SQL Query"}
            onChange={(e) => onTableQueryOptionChange(sourceData, e.target.value)}
          >
            <FormControlLabel value="Table Name" control={<Radio />} label="Table Name" />
            <FormControlLabel value="Custom SQL Query" control={<Radio />} label="Custom SQL Query" />
          </RadioGroup>
        </FormControl>

        {sourceData.config.table_name !== undefined && (
          <TextField
            label="Table Name"
            variant="outlined"
            fullWidth
            size="small"
            value={sourceData.config.table_name || ''}
            onChange={(e) => onConfigChange('table_name', e.target.value)}
            sx={{ mb: 2 }}
          />
        )}
        {sourceData.config.sql_query !== undefined && (
          <TextField
            label="Custom SQL Query"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={sourceData.config.sql_query || ''}
            onChange={(e) => onConfigChange('sql_query', e.target.value)}
            placeholder="e.g., SELECT * FROM my_table"
            sx={{ mb: 2 }}
          />
        )}

        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          size="small"
          value={sourceData.config.username || ''}
          onChange={(e) => onConfigChange('username', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          size="small"
          type="password"
          value={sourceData.config.password || ''}
          onChange={(e) => onConfigChange('password', e.target.value)}
          sx={{ mb: 2 }}
        />
      </>
    )}

    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>Schema Definition (Optional)</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Define column names and their types. If left empty and 'Infer Schema' is checked (for CSV), schema will be inferred.</Typography>
    <DataEditor
      data={sourceData.schema || [{ column_name: '', data_type: 'string', nullable: true }]}
      onChange={onSchemaChange}
      columnConfig={{
        column_name: { type: 'text', title: 'Column Name' },
        data_type: { type: 'selectbox', title: 'Data Type', options: ["string", "integer", "double", "boolean", "date", "timestamp"] },
        nullable: { type: 'checkbox', title: 'Nullable' }
      }}
      uniqueKeyPrefix={`${uniqueIdPrefix}-schema-${sourceData.id}`}
    />
  </Box>
);

export default SourceForm;