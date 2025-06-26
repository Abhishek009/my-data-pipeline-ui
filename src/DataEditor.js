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

export default DataEditor;