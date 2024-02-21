import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, InputLabel, TextField, Select, MenuItem } from '@mui/material';
import { useState } from 'react';

function AddElectionDialog(props) {
    const [newRow, setNewRow] = useState({});
    const [selectedType, setSelectedType] = useState('');

    const host = "http://localhost:8080";

    const handleCloseAddDialog = () => {
        props.setIsAddDialogOpen(false);
        setNewRow({});
    };

    const handleAddRow = () => {
        const newRowWithId = { "id": props.rows.length + 1, ...newRow };
        console.log(JSON.stringify(newRowWithId));
        const updatedRows = [...props.rows, newRowWithId];
        fetch(host + '/elections/update-electionparts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(props.password)
            },
            body: JSON.stringify(updatedRows),
        })
            .then((response) => {
                if (response.ok) {
                    props.setRows(updatedRows);
                    props.updateParentRows(updatedRows);
                    handleCloseAddDialog();
                    props.setText("Omröstning tillagt i server.");
                    props.setOpen(true);
                } else {
                    alert('Could not update server data. Try again.');
                }
            })
            .catch((error) => {
                console.log(error);
                alert('Something went wrong...');
            });
    };

    const handleNewRowChange = (field, value) => {
        if (field === 'type') {
            setSelectedType(value);
            setNewRow((prevRow) => ({ ...prevRow, [field]: value }));
        } else if (field === 'candidates') {
            const candidatesArray = value.split(/,\s*/);
            setNewRow((prevRow) => ({ ...prevRow, [field]: candidatesArray }));
        } else if (field === 'multipleCandidates1') {
            let currentArray = newRow.candidates || [];
            currentArray[0] = value;
            setNewRow((prevRow) => ({ ...prevRow, 'candidates': currentArray }));
        } else if (field === 'multipleCandidates2') {
            let currentArray = newRow.candidates || [];
            currentArray[1] = value;
            setNewRow((prevRow) => ({ ...prevRow, 'candidates': currentArray }));
        } else {
            setNewRow((prevRow) => ({ ...prevRow, [field]: value }));
        }
    };

    return (
        <Dialog open={props.isAddDialogOpen} onClose={handleCloseAddDialog} PaperProps={{ sx: { width: '500px' } }}>
            <DialogTitle>Lägg till omröstning</DialogTitle>
            <DialogContent>
                <InputLabel htmlFor="title-input">Titel</InputLabel>
                <TextField
                    required
                    sx={{ marginBottom: '16px' }}
                    id="title-input"
                    fullWidth
                    value={newRow.title || ''}
                    onChange={(e) => handleNewRowChange('title', e.target.value)}
                />
                <InputLabel htmlFor="typ-av-val-input">Typ av val</InputLabel>
                <Select
                    required
                    sx={{ marginBottom: '16px' }}
                    labelId="typ-av-val-label"
                    id="typ-av-val-input"
                    fullWidth
                    value={newRow.type || ''}
                    onChange={(e) => handleNewRowChange('type', e.target.value)}
                >
                    <MenuItem value="Personval">Personval</MenuItem>
                    <MenuItem value="Ja/Nej">Ja/Nej</MenuItem>
                    <MenuItem value="Flerval">Flerval</MenuItem>

                </Select>
                {selectedType === 'Personval' && (
                    <>
                        <InputLabel htmlFor="winnercount-input">Antal vinnare</InputLabel>
                        <TextField
                            required
                            sx={{ marginBottom: '16px' }}
                            id="winnercount-input"
                            fullWidth
                            value={newRow.winnercount || ''}
                            onChange={(e) => handleNewRowChange('winnercount', e.target.value)}
                        />
                        <InputLabel htmlFor="candidates-input">Kandidater</InputLabel>
                        <TextField
                            required
                            placeholder='Separera med komma'
                            sx={{ marginBottom: '16px' }}
                            id="candidates-input"
                            fullWidth
                            value={newRow.candidates || ''}
                            onChange={(e) => handleNewRowChange('candidates', e.target.value)}
                        />
                    </>
                )}
                {selectedType === 'Flerval' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <InputLabel htmlFor="alternative-1">Alternativ 1</InputLabel>
                            <div className='CharCount' style={{ marginLeft: 'auto' }}>{(newRow.alternative1 || '').length}/300 characters</div> {/* Add character count */}
                        </div>
                        <TextField
                            required
                            sx={{ marginBottom: '16px' }}
                            id="alternative-1"
                            fullWidth
                            value={newRow.alternative1 || ''}
                            onChange={(e) => { handleNewRowChange('alternative1', e.target.value); handleNewRowChange('multipleCandidates1', e.target.value) }}
                            inputProps={{ maxLength: 300 }} // Add maxLength attribute
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <InputLabel htmlFor="alternative-2">Alternativ 2</InputLabel>
                            <div className='CharCount' style={{ marginLeft: 'auto' }}>{(newRow.alternative2 || '').length}/300 characters</div> {/* Add character count */}
                        </div>
                        <TextField
                            required
                            sx={{ marginBottom: '16px' }}
                            id="alternative-2"
                            fullWidth
                            value={newRow.alternative2 || ''}
                            onChange={(e) => { handleNewRowChange('alternative2', e.target.value); handleNewRowChange('multipleCandidates2', e.target.value) }}
                            inputProps={{ maxLength: 300 }} // Add maxLength attribute
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAddDialog}>Avbryt</Button>
                <Button onClick={handleAddRow}>Lägg till</Button>
            </DialogActions>
        </Dialog>
    );

}

export default AddElectionDialog;
