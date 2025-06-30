import React, { useState, useCallback,useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  FormLabel,
 CircularProgress 
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


const SourceForm = ({ sourceData, onInputChange, onConfigChange, onSchemaChange, onTableQueryOptionChange, uniqueIdPrefix, isNew }) => {
  const [isLoadingDbDetails, setIsLoadingDbDetails] = useState(false);
  const [dbDetailsError, setDbDetailsError] = useState(null);

  // This effect simulates fetching database details and handles loading state.
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const handleDbChange = async () => {
      if (sourceData.type === "Database (SQL)") {
        if (sourceData.config.db_type) {
          setIsLoadingDbDetails(true); // Start loading when a specific DB type is selected
          setDbDetailsError(null); // Clear previous errors
          try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
            let details = {};
            switch (sourceData.config.db_type) {
              case 'PostgreSQL': details = { host: 'localhost', port: 5432, database: 'postgres_db', schema_name: 'public' }; break;
              case 'MySQL': details = { host: 'localhost', port: 3306, database: 'mysql_db', schema_name: 'mydb' }; break;
              case 'SQL Server': details = { host: 'localhost', port: 1433, database: 'sqlserver_db', schema_name: 'dbo' }; break;
              case 'Oracle': details = { host: 'localhost', port: 1521, database: 'oracle_sid', schema_name: 'system' }; break;
              case 'Hive': details = { host: 'localhost', port: 10000, database: 'default', schema_name: 'default' }; break;
              default: details = { host: '', port: '', database: '', schema_name: '' }; break;
            }
            if (isMounted) { // Only update if component is still mounted
              onConfigChange('host', details.host);
              onConfigChange('port', details.port);
              onConfigChange('database', details.database);
              onConfigChange('schema_name', details.schema_name);
            }
          } catch (error) {
            console.error("Failed to fetch database details:", error);
            if (isMounted) {
              setDbDetailsError("Failed to load database details. Please try again.");
            }
          } finally {
            if (isMounted) {
              setIsLoadingDbDetails(false); // Always stop loading regardless of success/error
            }
          }
        } else {
          // If db_type becomes empty (e.g., "Select a database type" is chosen), clear fields and loading state
          if (isMounted) {
            setIsLoadingDbDetails(false);
            setDbDetailsError(null);
            onConfigChange('host', '');
            onConfigChange('port', '');
            onConfigChange('database', '');
            onConfigChange('schema_name', '');
            // Also reset table_name/sql_query if they exist to reflect the cleared state
            onConfigChange('table_name', undefined);
            onConfigChange('sql_query', undefined);
          }
        }
      } else {
        // If dataset type changes away from "Database (SQL)", reset all related DB states
        if (isMounted) {
          setIsLoadingDbDetails(false);
          setDbDetailsError(null);
          onConfigChange('db_type', ''); // Ensure db_type is reset
          onConfigChange('host', '');
          onConfigChange('port', '');
          onConfigChange('database', '');
          onConfigChange('schema_name', '');
          onConfigChange('table_name', undefined);
          onConfigChange('sql_query', undefined);
        }
      }
    };

    handleDbChange(); // Call the async function immediately

    return () => {
      isMounted = false; // Cleanup: Mark component as unmounted
    };
  }, [sourceData.type, sourceData.config.db_type, onConfigChange]); // Re-run effect when these dependencies change


  return (
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
              value={sourceData.config.db_type || ''} // Set default value to empty string
              label="Database Type"
              onChange={(e) => onConfigChange('db_type', e.target.value)}
            >
              <MenuItem value="">Select a database type</MenuItem> {/* New initial option */}
              {["PostgreSQL", "MySQL", "SQL Server", "Oracle", "Hive"].map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {isLoadingDbDetails && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">Loading database details...</Typography>
            </Box>
          )}

          {dbDetailsError && (
            <Typography variant="body2" color="error" sx={{ my: 2 }}>
              {dbDetailsError}
            </Typography>
          )}
          
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
            value={sourceData.config.port || ''} // Default port is set by fetchMockDbDetails
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
          {/* New field for Schema Name */}
          <TextField
            label="Schema Name (Optional)"
            variant="outlined"
            fullWidth
            size="small"
            value={sourceData.config.schema_name || ''}
            onChange={(e) => onConfigChange('schema_name', e.target.value)}
            sx={{ mb: 2 }}
            placeholder="e.g., public or default"
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
};

export default SourceForm;