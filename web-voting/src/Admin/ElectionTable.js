import * as React from 'react';
import './ElectionTable.css';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AddElectionDialog from './AddElectionDialog';
import EditElectionDialog from './EditElectionDialog';

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
    const host = "https://vote-server.isek.se";

    const [rows, setRows] = useState([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [open, setOpen] = useState(false); //Success message
    const [snackText, setText] = useState("");
    const [password, setPassword] = useState();

    useEffect(() => {
        if (props.password) {
            setPassword(props.password);
            props.updateParentRows(rows);
            getInitialDataFromServer();
        }

        // eslint-disable-next-line
    }, [props.password, password]);

    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleOpenEditDialog = () => {
        setIsEditDialogOpen(true);
    }

    const handleMoveRow = (direction) => {
        const currentIndex = parseInt(props.currentId) - 1;
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= rows.length) {
            return; // No need to move if the new index is out of bounds
        }

        const updatedRows = [...rows];
        const movedRow = updatedRows.splice(currentIndex, 1)[0];
        updatedRows.splice(newIndex, 0, movedRow);

        const redistributedRows = updatedRows.map((row, index) => ({
            ...row,
            id: (index + 1).toString(),
        }));

        setRows(redistributedRows);
        props.updateParentRows(redistributedRows);
        props.setCurrentId(newIndex + 1);
        props.setSelectedElection(newIndex + 1);

        const url = host + "/elections/update-electionparts";
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Basic ' + btoa(props.password)
            },
            body: JSON.stringify(redistributedRows),
        })
            .then((response) => {
                if (response.ok) {
                    // Handle success
                } else {
                    alert("Could not update server data. Try again.");
                }
            })
            .catch((error) => {
                console.log(error);
                alert("Something went wrong...");
            });
    }

    const handleRemoveRow = () => {
        const updatedRows = rows.filter(
            (row) => row.id.toString() !== props.currentId.toString()
        );

        // Redistribute ids for the remaining rows
        const redistributedRows = updatedRows.map((row, index) => ({
            ...row,
            id: (index + 1).toString(),
        }));

        setRows(redistributedRows);
        props.updateParentRows(redistributedRows);

        let url = host + "/elections/update-electionparts";
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Basic ' + btoa(props.password)
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
    };

    function getInitialDataFromServer() {
        let url = host + '/elections/getdata';
        let headers = {
            'Authorization': 'Basic ' + btoa(props.password) // Use btoa to encode the password
        };
        fetch(url, { headers })
            .then((response) => response.json())
            .then((data) => {
                setRows(data);
                props.updateParentRows(data);
            })
            .catch((error) => {
                console.log(error);
                alert(
                    'Connection to server could not be established. \nCheck host and Voter ID.'
                );
            });
    }

    function getDataFromServer() {
        let url = host + '/elections/getdata';
        let headers = {
            'Authorization': 'Basic ' + btoa(props.password) // Use btoa to encode the password
        };
        fetch(url, { headers })
            .then((response) => response.json())
            .then((data) => {
                // Filter the data to get only the row with the currentId
                const currentRowData = data.find(row => row.id.toString() === props.currentId.toString());
                // Update the state with the new data
                setRows(rows.map(row => row.id.toString() === props.currentId.toString() ? currentRowData : row));
                props.updateParentRows(rows.map(row => row.id.toString() === props.currentId.toString() ? currentRowData : row));
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenAddDialog}
                    className='tableButtonGrid'
                    title="Lägg till ny omröstning"
                >
                    <AddIcon />
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={props.currentId === 0 || props.electionRunning}
                    onClick={handleRemoveRow}
                    className='tableButtonGrid'
                    title="Ta bort omröstning"

                >
                    <DeleteIcon />
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    className='tableButtonGrid'
                    disabled={props.currentId === 0 || props.electionRunning}
                    onClick={handleOpenEditDialog}
                    title="Redigera omröstning"

                >
                    <EditIcon />
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    className='tableButtonGrid'
                    disabled={props.currentId === 0 || props.electionRunning}
                    onClick={() => handleMoveRow('up')}
                    title="Flytta vald omröstning ned upp steg"

                >
                    <ArrowUpwardIcon />
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    className='tableButtonGrid'
                    disabled={props.currentId === 0 || props.electionRunning}
                    onClick={() => handleMoveRow('down')}
                    title="Flytta vald omröstning ned ett steg"

                >
                    <ArrowDownwardIcon />
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
                        props.setCurrentId(selectedRowId);
                        props.setSelectedElection(selectedRowId);
                    }}
                    getRowClassName={(params) => {
                        if (params.row.id.toString() === props.currentId.toString() && props.electionRunning) {
                            return 'highlighted-row'; // Apply the CSS class for the highlighted row
                        } else if (params.row.id.toString() === props.currentId.toString()){
                            return 'highlighted-row-not-running'; 
                        } else {
                            return 'other-rows'; 
                        }
                    }}

                />
                <AddElectionDialog isAddDialogOpen={isAddDialogOpen} password={password} rows={rows} setRows={setRows} setOpen={setOpen} setText={setText} setIsAddDialogOpen={setIsAddDialogOpen} updateParentRows={props.updateParentRows} />
                <EditElectionDialog isEditDialogOpen={isEditDialogOpen} password={password} rows={rows} setRows={setRows} setOpen={setOpen} setText={setText} setIsEditDialogOpen={setIsEditDialogOpen} updateParentRows={props.updateParentRows} currentId={props.currentId}/>

            </div>
        </div>
    );
}