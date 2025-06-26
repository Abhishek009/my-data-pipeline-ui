
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Box, Button, Paper, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const ConfigViewer = ({ pipelineConfig, downloadConfig }) => (
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
);

export default ConfigViewer;