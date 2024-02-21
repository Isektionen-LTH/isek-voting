import React from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


const FileUploadComponent = ({ onFileUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onFileUpload(file);
  };

  return (
    <Button
      variant="contained"
      component="label"
      sx={{ gap: '13px', alignItems: 'center', fontSize: '12px' }}
      style={{ width: '45%', marginBottom: '10px'}}
    >
      <CloudUploadIcon /> Ladda upp gästlista
      <input
        type="file"
        hidden
        onChange={handleFileChange}
      />
    </Button>
  );
};

export default FileUploadComponent;
