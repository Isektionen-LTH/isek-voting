import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, InputLabel, TextField, Select, MenuItem } from '@mui/material';
import { useState } from 'react';

function EditElectionDialog(props) {
    const [editedRow, setEditedRow] = useState({});
    const [selectedType, setSelectedType] = useState('');

    const host = "http://localhost:8080";

    useEffect(() => {
        // Pre-fill the dialog content based on the row with the currentId
        const rowToEdit = props.rows.find(row => row.id.toString() === props.currentId);
        if (rowToEdit) {
            prepareRowToEdit(rowToEdit);
        }
        // eslint-disable-next-line
    }, [props.isEditDialogOpen]);


    const prepareRowToEdit = (rowToEdit) => {
        const type = rowToEdit.type;
        let preparedRow = {};

        if (type === 'Personval') {
            const { id, title, type, winnercount, candidates } = rowToEdit;
            preparedRow = { id, title, type, winnercount, candidates };
        } else if (type === 'Flerval') {
            const { id, title, type, alternative1, alternative2, candidates } = rowToEdit;
            preparedRow = { id, title, type, alternative1, alternative2, candidates };
        } else if (type === 'Ja/Nej') {
            const { id, title, type } = rowToEdit;
            preparedRow = { id, title, type };
        }

        setSelectedType(preparedRow.type);
        setEditedRow(preparedRow);
    };

    const handleCloseEditDialog = () => {
        props.setIsEditDialogOpen(false);
        setEditedRow({});
    };

    const handleEditRow = () => {
        //If the edited row is of type Flerval, only the first two candidates are used. Otherwise if changed from Personval "more" candidates will be left, which is wrong. 
        if (editedRow.type === 'Flerval' && editedRow.candidates) {
            editedRow.candidates = editedRow.candidates.slice(0, 2);
        }

        const updatedRows = props.rows.map(row => {
            if (row.id.toString() === props.currentId) {
                return editedRow;
            }
            return row;
        });

        fetch(host + '/elections/update-electionparts/' + props.password, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedRows),
        })
            .then((response) => {
                if (response.ok) {
                    props.setRows(updatedRows);
                    props.updateParentRows(updatedRows);
                    handleCloseEditDialog();
                    props.setText("Omröstning ändrad i server.");
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

    const handleEditedRowChange = (field, value) => {
        if (field === 'type') {
            setSelectedType(value);
            setEditedRow((prevRow) => ({ ...prevRow, [field]: value }));
        } else if (field === 'candidates') {
            const candidatesArray = value.split(/,\s*/);
            setEditedRow((prevRow) => ({ ...prevRow, [field]: candidatesArray }));
        } else if (field === 'multipleCandidates1') {
            let currentArray = editedRow.candidates || [];
            currentArray[0] = value;
            setEditedRow((prevRow) => ({ ...prevRow, 'candidates': currentArray }));
        } else if (field === 'multipleCandidates2') {
            let currentArray = editedRow.candidates || [];
            currentArray[1] = value;
            setEditedRow((prevRow) => ({ ...prevRow, 'candidates': currentArray }));
        } else {
            setEditedRow((prevRow) => ({ ...prevRow, [field]: value }));
        }
    };

    return (
        <Dialog open={props.isEditDialogOpen} onClose={handleCloseEditDialog} PaperProps={{ sx: { width: '500px' } }}>
            <DialogTitle>Redigera omröstning</DialogTitle>
            <DialogContent>
                <InputLabel htmlFor="title-input">Titel</InputLabel>
                <TextField
                    required
                    sx={{ marginBottom: '16px' }}
                    id="title-input"
                    fullWidth
                    value={editedRow.title || ''}
                    onChange={(e) => handleEditedRowChange('title', e.target.value)}
                />
                <InputLabel htmlFor="typ-av-val-input">Typ av val</InputLabel>
                <Select
                    required
                    sx={{ marginBottom: '16px' }}
                    labelId="typ-av-val-label"
                    id="typ-av-val-input"
                    fullWidth
                    value={editedRow.type || ''}
                    onChange={(e) => handleEditedRowChange('type', e.target.value)}
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
                            value={editedRow.winnercount || ''}
                            onChange={(e) => handleEditedRowChange('winnercount', e.target.value)}
                        />
                        <InputLabel htmlFor="candidates-input">Kandidater</InputLabel>
                        <TextField
                            required
                            placeholder='Separera med komma'
                            sx={{ marginBottom: '16px' }}
                            id="candidates-input"
                            fullWidth
                            value={editedRow.candidates || ''}
                            onChange={(e) => handleEditedRowChange('candidates', e.target.value)}
                        />
                    </>
                )}
                {selectedType === 'Flerval' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <InputLabel htmlFor="alternative-1">Alternativ 1</InputLabel>
                            <div className='CharCount' style={{ marginLeft: 'auto' }}>{(editedRow.alternative1 || '').length}/300 characters</div> {/* Add character count */}
                        </div>
                        <TextField
                            required
                            sx={{ marginBottom: '16px' }}
                            id="alternative-1"
                            fullWidth
                            value={editedRow.alternative1 || ''}
                            onChange={(e) => { handleEditedRowChange('alternative1', e.target.value); handleEditedRowChange('multipleCandidates1', e.target.value) }}
                            inputProps={{ maxLength: 300 }} // Add maxLength attribute
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <InputLabel htmlFor="alternative-2">Alternativ 2</InputLabel>
                            <div className='CharCount' style={{ marginLeft: 'auto' }}>{(editedRow.alternative2 || '').length}/300 characters</div> {/* Add character count */}
                        </div>
                        <TextField
                            required
                            sx={{ marginBottom: '16px' }}
                            id="alternative-2"
                            fullWidth
                            value={editedRow.alternative2 || ''}
                            onChange={(e) => { handleEditedRowChange('alternative2', e.target.value); handleEditedRowChange('multipleCandidates2', e.target.value) }}
                            inputProps={{ maxLength: 300 }} // Add maxLength attribute
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseEditDialog}>Avbryt</Button>
                <Button onClick={handleEditRow}>Spara ändringar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditElectionDialog;
