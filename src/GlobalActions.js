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

const GlobalActions = ({ simulateRunPipeline, loadConfigFromFile }) => (
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
        component="label"
        startIcon={<UploadFileIcon />}
      >
        Upload File
        <input type="file" accept=".json" onChange={loadConfigFromFile} hidden />
      </Button>
    </Box>
  </Paper>
);

export default GlobalActions;