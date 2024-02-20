import * as React from 'react';
import './ElectionTable.css';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const columns = [
    { field: 'id', headerName: 'ID', width: 10, editable: false },
    { field: 'title', headerName: 'Titel', width: 200, editable: false },
    { field: 'type', headerName: 'Typ av val', width: 100, editable: false },
    { field: 'winnercount', headerName: 'Antal vinnare', width: 120, editable: false },
    { field: 'voteprogress', headerName: 'Antal som röstat', width: 150, editable: false },
    { field: 'winner', headerName: 'Vinnare', width: 400, editable: false },
    { field: 'candidates', headerName: 'Kandidater', width: 800, editable: false },
];

export default function DataTable(props) {
    const host = "http://localhost:8080";

    const [rows, setRows] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newRow, setNewRow] = useState({});
    const [selectedRowModel, setSelectedRowModel] = useState([]);
    const [open, setOpen] = useState(false); //Success message
    const [snackText, setText] = useState("");
    const [password, setPassword] = useState();
    const [selectedType, setSelectedType] = useState('');

    const [longPollingGoing, setGoing] = useState(false);

    useEffect(() => {
        if (props.password) {
            setPassword(props.password);
            props.updateParentRows(rows);
            getDataFromServer();
        }
        if (!longPollingGoing && password) {
            setGoing(true);
            // Start long polling when the component mounts
            //longPollingResults();
        }
        // eslint-disable-next-line
    }, [props.password, password, longPollingGoing]);

    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
        setNewRow({});
    };

    const handleAddRow = () => {
        const newRowWithId = { "id": rows.length + 1, ...newRow };
        const updatedRows = [...rows, newRowWithId];
        fetch(host + '/elections/update-electionparts/' + password, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedRows),
        })
            .then((response) => {
                if (response.ok) {
                    setRows(updatedRows);
                    props.updateParentRows(updatedRows);
                    handleCloseAddDialog();
                    setText("Omröstning tillagt i server.");
                    setOpen(true);
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


    const handleRemoveRow = () => {
        const updatedRows = rows.filter(
            (row) => !selectedRowModel.includes(row.id.toString())
        );

        // Redistribute ids for the remaining rows
        const redistributedRows = updatedRows.map((row, index) => ({
            ...row,
            id: (index + 1).toString(),
        }));

        setRows(redistributedRows);
        props.updateParentRows(redistributedRows);

        let url = host + "/elections/update-electionparts/" + password;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(redistributedRows),
        })
            .then((response) => {
                if (response.ok) {
                    setText("Omröstning borttaget i servern.");
                    setOpen(true);
                } else {
                    alert("Could not update server data. Try again.");
                }
            })
            .catch((error) => {
                console.log(error);
                alert("Something went wrong...");
            });

        setSelectedRowModel([]);
    };

    /* function getDataFromServer() {
        let url = host + '/elections/getdata/' + props.password;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                console.log(JSON.stringify(data));  
                setRows(data);
                props.updateParentRows(data);
            })
            .catch((error) => {
                console.log(error);
                alert(
                    'Connection to server could not be established. \nCheck host and Voter ID.'
                );
            });
    } */

    function getDataFromServer() {
        let url = host + '/elections/getdata/' + props.password;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {    
                // Filter the data to get only the row with the currentId
                const currentRowData = data.find(row => row.id === props.currentId);
    
                // Update the state with the new data
                setRows(rows.map(row => row.id === props.currentId ? currentRowData : row));
                props.updateParentRows(rows.map(row => row.id === props.currentId ? currentRowData : row));
            })
            .catch((error) => {
                console.log(error);
                alert(
                    'Connection to server could not be established. \nCheck host and Voter ID.'
                );
            });
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <div>
            <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'left', }}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    {snackText}
                </Alert>
            </Snackbar>
            <div className='mainDiv'>
                <Button variant="contained" color="primary" onClick={handleOpenAddDialog} className='tableButtonGrid'>
                    Skapa ny omröstning
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={selectedRowModel.length === 0}
                    onClick={handleRemoveRow}
                    className='tableButtonGrid'
                >
                    Ta bort omröstning
                </Button>
                <Button variant="contained" color="primary" className='getResultsButton' onClick={getDataFromServer}>
                    Hämta resultat från servern
                </Button>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    onRowClick={(params) => {
                        const selectedRowId = params.row.id.toString();
                        if (selectedRowModel.includes(selectedRowId)) {
                            setSelectedRowModel((prevSelectedRowModel) =>
                                prevSelectedRowModel.filter((id) => id !== selectedRowId)
                            );
                        } else {
                            setSelectedRowModel((prevSelectedRowModel) => [
                                ...prevSelectedRowModel,
                                selectedRowId,
                            ]);
                        }
                    }}
                    getRowClassName={(params) => {
                        if (params.row.id.toString() === props.currentId.toString()) {
                            return 'highlighted-row'; // Apply the CSS class for the highlighted row
                        }
                        return ''; // No additional CSS class
                    }}

                />

                <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog} PaperProps={{ sx: { width: '500px' } }}>
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
            </div>
        </div>
    );
}