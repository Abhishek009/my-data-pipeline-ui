import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  TextField,
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



const PipelineMetadata = ({ pipelineName, description, onNameChange, onDescriptionChange }) => (
  <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
    <TextField
      label="Pipeline Name"
      variant="outlined"
      fullWidth
      value={pipelineName}
      onChange={(e) => onNameChange(e.target.value)}
      sx={{ mb: 3 }}
    />
    <TextField
      label="Pipeline Description"
      variant="outlined"
      fullWidth
      multiline
      rows={2}
      value={description}
      onChange={(e) => onDescriptionChange(e.target.value)}
    />
  </Paper>
);

export default PipelineMetadata;