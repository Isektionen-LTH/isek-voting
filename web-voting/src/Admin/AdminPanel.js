import React, { useEffect, useState } from 'react';
import FileUploadComponent from './FileUploadComponent';
import './AdminPanel.css';
import Menu from './Menu.js';
import Button from '@mui/material/Button';
import ElectionTable from './ElectionTable.js';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';
import { Checkbox } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Close as CloseIcon } from '@mui/icons-material';

function CreateElection(props) {
    const host = "http://localhost:8080";

    const [password, setPassword] = useState("");
    const [electionRunning, setRunning] = useState();
    const [tableRows, setTableRows] = useState([]); // New state for table rows
    const [currentId, setCurrentId] = useState(); // Nuvarande delval (grönmarkerad)

    const [open, setOpen] = useState(false); //Success message
    const [snackText, setText] = useState("");
    const [severity, setSeverity] = useState('success');

    const [addVoterDialogOpen, setAddVoterDialogOpen] = useState(false);
    const [newVoterId, setNewVoterId] = useState(generateRandomValkod);
    const [newVoterName, setNewVoterName] = useState("");
    const [newVoterEmail, setNewVoterEmail] = useState("");
    const [checked, setChecked] = useState(false);


    const [removeVoterDialogOpen, setRemoveVoterDialogOpen] = useState(false);
    const [removeVoterId, setRemoveVoterId] = useState("");

    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [showWrongPassword, setShowWrongPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");

    const [sendEmailsDialogOpen, setSendAllRemailsDialogOpen] = useState(false);

    const [removeAllDialogOpen, setRemoveAllDialogOpen] = useState(false);

    const [sendSingleEmailDialogOpen, setSendSingleEmailDialogOpen] = useState(false);
    const [email, setEmail] = useState("");

    const [showLoading, setShowLoading] = useState(false);

    const [ShowAllVotersDialogOpen, setShowAllVotersDialogOpen] = useState(false);
    const [allVoters, setAllVoters] = useState([]);

    useEffect(() => {
        getCurrentPart();
        setPassword(props.password);
    }, [props.password]);

    const menuFunctions = {
        setAddVoterDialogOpen,
        setRemoveVoterDialogOpen,
        setRemoveAllDialogOpen,
        setSendAllRemailsDialogOpen,
        setSendSingleEmailDialogOpen,
        setResetPasswordDialogOpen,
        getAllVoters,
    };

    function getCurrentPart() {
        let url = host + '/get-current-part';

        fetch(url)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    setSeverity("error");
                    setText("Något gick fel, försök gärna igen.");
                    setOpen(true);
                }
            }).then((data) => {
                if (data !== 0) {
                    setRunning(true);
                } else {
                    setRunning(false);
                }
                setCurrentId(data.id);
            })
            .catch((error) => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            });
    }

    const handleFileUpload = async (file) => {
        const contents = await readFileAsText(file);
        const parsedData = parseCsvData(contents);
        updateVoters(parsedData); // Pass the parsed data to the updateVoters function

    };

    const readFileAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    };

    const parseCsvData = (csvContent) => {
        const lines = csvContent.split('\n');
        const headers = lines[0].split('\t');
        const data = [];

        const guestNameIndex = headers.indexOf('Guest name');
        const emailIndex = headers.indexOf('Email');
        const ticketNumberIndex = headers.indexOf('Ticket number');
        const checkedInIndex = headers.indexOf('Checked in');

        for (let i = 1; i < lines.length; i++) {
            const fields = lines[i].split('\t');
            if (fields.length === headers.length) {
                const name = fields[guestNameIndex];
                const email = fields[emailIndex];
                const voterId = fields[ticketNumberIndex];
                const checkedIn = fields[checkedInIndex];
                if (checkedIn === 'Yes') {
                    data.push({ name, email, voterId });
                }
            }
        }
        return JSON.stringify(data);
    };


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    function updateCurrentId(id) {
        let url = host + "/set-current-part";
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(password)
            },
            body: id
        }).then(response => {
            if (response.ok) {
                if (id === 0) {
                    setSeverity("success");
                    setText("Omröstningen är avslutad");
                } else {
                    setSeverity("success");
                    setText("Aktiv omröstning ändrad till " + id);
                }
                setOpen(true);
            } else {
                alert("Server error. Try again");
            }
        }).catch(error => {
            setSeverity("error");
            setText("Något gick fel, försök gärna igen.");
            setOpen(true);
        });
    }


    const startElection = (event) => {
        if (!electionRunning) {
            if (currentId === 0 || currentId === undefined || currentId > tableRows.length) {
                setSeverity('error');
                setText("Ingen omröstning vald. Välj en omröstning att starta.");
                setOpen(true);
            } else {
                updateCurrentId(currentId);
                setRunning(electionRunning => !electionRunning);
            }
        } else {
            updateCurrentId(0);
            setRunning(electionRunning => !electionRunning);
        }
    };

    function setSelectedElection(id) {
        if (electionRunning) {
            updateCurrentId(id);
        }
    }

    /* function nextElection(event) {
        if (currentId === undefined) {
            setCurrentId(1);
        }
        let id = currentId + 1;
        if (id > 0 && id <= tableRows.length) {
            setCurrentId(id);
            if (electionRunning) {
                updateCurrentId(id);
            }
        }
    }

    function previousElection(event) {
        let id = currentId - 1;
        if (id > 0 && id <= tableRows.length) {
            setCurrentId(id);
            if (electionRunning) {
                updateCurrentId(id);
            }
        }
    } */

    function updateVoters(parsedData) {
        let url = host + "/elections/update-voters";
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(password)
            },
            body: parsedData
        }).then(response => {
            if (response.ok) {
                setSeverity('success');
                setText("Valkoder har uppdaterats i servern.");
                setOpen(true);
            } else {
                alert("Could not be handled by server. Try again.");
            }
        }).catch(error => {
            setSeverity("error");
            setText("Något gick fel, försök gärna igen.");
            setOpen(true);
        });
    }

    function updateVoterRoles(voterId, newRole) {
        let data = { "voterId": voterId, "role": newRole };
        let url = host + "/elections/update-roles";
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(password)
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                setSeverity('success');
                setText("Rollen har uppdaterats på servern.");
                setOpen(true);
                getAllVoters();
            } else {
                alert("Could not be handled by server. Try again.");
            }
        }).catch(error => {
            setSeverity("error");
            setText("Något gick fel, försök gärna igen.");
            setOpen(true);
        });
    }

    function addVoter() {
        if (newVoterId === "") {
            setAddVoterDialogOpen(true);
        } else {
            setAddVoterDialogOpen(false);

            let url = host + "/elections/add-voter";
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(password)
                },
                body: JSON.stringify({ "name": newVoterName, "voterId": newVoterId, "email": newVoterEmail })
            }).then(response => {
                if (response.ok) {
                    setSeverity('success');
                    setText("Valkod tillagd i server: " + newVoterId);
                    setOpen(true);
                    if (checked) {
                        sendNewVoterEmail(newVoterEmail);
                    }
                } else {
                    alert("Could not be handled by server. Try again.");
                }
            }).catch(error => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            });
            let newId = generateRandomValkod;
            setNewVoterId(newId);
            setNewVoterName("");
            setNewVoterEmail("");
            setChecked(false);
        }
    }

    function removeVoter(voterId) {
        return new Promise((resolve, reject) => {
            if (voterId) {
                let url = host + "/elections/remove-voter";
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa(password)
                    },
                    body: JSON.stringify({ "voterId": voterId })
                })
                    .then(response => {
                        if (response.ok) {
                            response.json().then(data => {
                                if (data === "Voter doesn't exist") {
                                    setSeverity("error");
                                    setText("Valkod \"" + voterId + "\" finns inte på servern.");
                                    setOpen(true);
                                    resolve();
                                } else {
                                    setSeverity("success");
                                    setText("Valkod borttagen från servern: " + voterId);
                                    setOpen(true);
                                    resolve();
                                    setRemoveVoterDialogOpen(false);
                                }
                            });
                        } else {
                            alert("Could not be handled by the server. Please try again.");
                            resolve();
                        }
                    })
                    .catch(error => {
                        setSeverity("error");
                        setText("Något gick fel, försök gärna igen.");
                        setOpen(true);
                        reject(error);
                    });
            } else {
                setRemoveVoterDialogOpen(true);
                resolve();
            }
        });
    }

    function sendAllEmails() {
        let url = host + '/send-emails';
        setShowLoading(true);
        let headers = {
            'Authorization': 'Basic ' + btoa(password) // Use btoa to encode the password
        };
        fetch(url, { headers })
            .then((response) => {
                if (response.ok) {
                    setSendAllRemailsDialogOpen(false);
                    return response.json();
                } else {
                    setSeverity("error");
                    setText("Något gick fel, försök gärna igen.");
                    setOpen(true);
                }
            }).then((data) => {
                setSeverity("success");
                setText("Mejl som skickats: " + data);
                setOpen(true);
            })
            .catch((error) => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            })
            .finally(() => {
                setShowLoading(false);
            });

    }

    function sendSingleEmail() {
        let url = host + "/send-single-email";
        setShowLoading(true);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(password)
            },
            body: email
        })
            .then(response => {
                if (response.ok) {
                    setSeverity("success");
                    setText("Mejlet har skickats.");
                    setOpen(true);
                    setSendSingleEmailDialogOpen(false);
                }
            })
            .catch(error => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            })
            .finally(() => {
                setShowLoading(false);
            });
    }

    function sendNewVoterEmail(newEmail) {
        let url = host + "/send-single-email";
        setShowLoading(true);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(password)
            },
            body: newEmail
        })
            .then(response => {
                if (response.ok) {
                    setSeverity("success");
                    setText("Mejlet har skickats.");
                    setOpen(true);
                    setSendSingleEmailDialogOpen(false);
                }
            })
            .catch(error => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            })
            .finally(() => {
                setShowLoading(false);
            });
    }

    function resetPassword() {
        setShowLoading(true);
        if (oldPassword === password) {
            setShowWrongPassword(false);
            let url = host + "/update-password";
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(password)
                },
                body: newPassword
            }).then(response => {
                if (response.ok) {
                    setSeverity("success");
                    setText("Lösenordet har ändrats.");
                    setOpen(true);
                    setResetPasswordDialogOpen(false);
                    setPassword(newPassword);
                    props.setPassword(newPassword);
                    setShowWrongPassword(false);
                    setNewPassword("");
                    setOldPassword("");
                }
            }).catch(error => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            })
                .finally(() => {
                    setShowLoading(false);
                });
        } else {
            setShowWrongPassword(true);
        }

    }

    function removeAllVoters() {
        let url = host + '/remove-all-voters';
        let headers = {
            'Authorization': 'Basic ' + btoa(password) // Use btoa to encode the password
        };
        fetch(url, { headers })
            .then((response) => {
                if (response.ok) {
                    setRemoveAllDialogOpen(false);
                    setSeverity("success");
                    setText("Alla valkoder har tagits bort.");
                    setOpen(true);
                    return response.json();
                } else {
                    alert("Server error.");
                }
            }).then((data) => console.log(data))
            .catch((error) => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            });
    }

    function getAllVoters() {
        let url = host + '/get-all-voters/';
        let headers = {
            'Authorization': 'Basic ' + btoa(password) // Use btoa to encode the password
        };
        fetch(url, { headers })
            .then((response) => {
                return response.json();
            }).then((data) => {
                setAllVoters(data);
                setShowAllVotersDialogOpen(true);
            })
            .catch((error) => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            });
    }

    function generateRandomValkod() {
        // Generate a random valkod in the specified format
        const valkod = `${generateRandomSegment()}-${generateRandomSegment()}-${generateRandomSegment()}`;
        return valkod;
    }

    function generateRandomSegment() {
        // Generate a random segment (e.g., '3TC7')
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let segment = '';
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            segment += characters.charAt(randomIndex);
        }
        return segment;
    }






    return (
        <div className='App'>
            <meta name="viewport" content="width=1920"></meta>
            <div>
                {showLoading && (
                    <div className='loading-overlay'>
                        <div className='loading-spinner'>
                            <CircularProgress className='loading' />
                        </div>
                    </div>
                )}
            </div>
            <Menu menuFunctions={menuFunctions} />
            {/* <Button style={{ position: 'absolute', top: '10px', left: '10px' }} onClick={test}>TEST</Button> */}
            <Dialog open={addVoterDialogOpen} onClose={() => setAddVoterDialogOpen(false)}>
                <DialogTitle>Lägg till valkod</DialogTitle>
                <DialogContent>
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Namn"
                        value={newVoterName}
                        onChange={(e) => setNewVoterName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Email"
                        value={newVoterEmail}
                        onChange={(e) => setNewVoterEmail(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Valkod"
                        value={newVoterId}
                        onChange={(e) => setNewVoterId(e.target.value)}
                        fullWidth
                    />
                    <FormControlLabel
                        label="Skicka valkod på mejl"
                        control={
                            <Checkbox
                                checked={checked}
                                onChange={() => { setChecked(!checked); }}
                            />
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddVoterDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={addVoter}>Lägg till</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                maxWidth="xl"
                open={ShowAllVotersDialogOpen}
                onClose={() => setShowAllVotersDialogOpen(false)}
                scroll="paper"
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <div style={{ position: 'relative' }}>
                    <CloseIcon
                        onClick={() => setShowAllVotersDialogOpen(false)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '20px',
                            cursor: 'pointer',
                            marginTop: '5px', // Added margin-top to vertically align with QuestionMarkIcon
                        }}
                    />

                    <DialogTitle id="scroll-dialog-title">Alla valkoder</DialogTitle>
                    <DialogContent dividers>
                        <DialogContentText
                            id="scroll-dialog-description"
                            tabIndex={-1}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto auto auto auto auto',
                                columnGap: '30px',
                                rowGap: '10px'
                            }}
                        >
                            {/* Column Titles */}
                            <div style={{ fontWeight: 'bold' }}>Namn</div>
                            <div style={{ fontWeight: 'bold' }}>Valkod</div>
                            <div style={{ fontWeight: 'bold' }}>Email</div>
                            <div style={{ fontWeight: 'bold' }}>Roll</div>
                            <div style={{ fontWeight: 'bold' }}></div>

                            {allVoters && allVoters.length > 0 ? (
                                allVoters.map((item) => (
                                    <React.Fragment key={item.voterId}>
                                        <div>{item.name}</div>
                                        <div>{item.voterId}</div>
                                        <div>{item.email}</div>
                                        <Button
                                            style={{
                                                background:
                                                    item.role === 'utslag' ? '#006570' : item.role === 'styr' ? '#008001' : 'grey',
                                                height: '25px',
                                                color: 'white',
                                            }}
                                            onClick={() => {
                                                let newRole;
                                                if (item.role === 'voter' || item.role === undefined) {
                                                    newRole = 'styr';
                                                } else if (item.role === 'styr') {
                                                    newRole = 'utslag';
                                                } else {
                                                    newRole = 'voter';
                                                }

                                                // Create a copy of allVoters with the updated role
                                                const updatedVoters = allVoters.map((voter) =>
                                                    voter.voterId === item.voterId ? { ...voter, role: newRole } : voter
                                                );

                                                // Update the state with the new voter data
                                                setAllVoters(updatedVoters)

                                                // Make the API call to update the server and fetch updated data
                                                updateVoterRoles(item.voterId, newRole);

                                            }}
                                        >
                                            {item.role === 'voter' || item.role === undefined ? 'Röstare' : item.role}
                                        </Button>

                                        <Button
                                            style={{ background: '#70002D', height: '25px', color: 'white' }}
                                            onClick={() => {
                                                removeVoter(item.voterId)
                                                    .then(async () => {
                                                        // After removing the voter, update the state to trigger a re-render
                                                        const updatedData = await getAllVoters();
                                                        setAllVoters(updatedData);
                                                    });
                                            }}
                                        >
                                            Ta bort
                                        </Button>
                                    </React.Fragment>
                                ))
                            ) : (
                                <div>Inga aktiva valkoder</div>
                            )}

                            {allVoters && (
                                <div style={{ gridColumn: '1 / span 5', textAlign: 'left', fontWeight: 'bold', marginTop: '20px' }}>
                                    Totalt antal valkoder: {allVoters.length || "0"}
                                </div>
                            )}

                        </DialogContentText>
                    </DialogContent>
                </div>
            </Dialog>
            <Dialog open={removeVoterDialogOpen} onClose={() => setRemoveVoterDialogOpen(false)}>
                <DialogTitle>Ta bort valkod</DialogTitle>
                <DialogContent>
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Valkod"
                        value={removeVoterId}
                        onChange={(e) => setRemoveVoterId(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRemoveVoterDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={() => { removeVoter(removeVoterId); setRemoveVoterId(''); }}>Ta bort</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)}>
                <DialogTitle>Ändra lösenord</DialogTitle>
                <DialogContent>
                    <div>Nytt lösenord kommer att mejlas till voting@isek.se</div>
                    <TextField
                        helperText={showWrongPassword && "Fel lösenord"}
                        error={showWrongPassword}
                        style={{ marginTop: '10px' }}
                        label="Ange nuvarande lösenord"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Ange nytt lösenord"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setResetPasswordDialogOpen(false);
                        setShowWrongPassword(false)
                    }}>
                        Avbryt</Button>
                    <Button onClick={resetPassword}>Ändra</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={sendEmailsDialogOpen} onClose={() => setSendAllRemailsDialogOpen(false)}>
                <DialogTitle>Skicka valkoder</DialogTitle>
                <DialogContent>
                    <div>Är du säker på att du vill skicka alla valkoder?</div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSendAllRemailsDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={sendAllEmails}>Skicka</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={removeAllDialogOpen} onClose={() => setRemoveAllDialogOpen(false)}>
                <DialogTitle>Ta bort alla valkoder</DialogTitle>
                <DialogContent>
                    <div>Är du säker på att du vill ta bort alla valkoder?</div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRemoveAllDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={removeAllVoters}>Ta bort valkoder</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={sendSingleEmailDialogOpen} onClose={() => setSendSingleEmailDialogOpen(false)}>
                <DialogTitle>Skicka en valkod</DialogTitle>
                <DialogContent>
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Ange email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSendSingleEmailDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={sendSingleEmail}>Skicka</Button>
                </DialogActions>
            </Dialog>
            <div className='frame'>
                <h1 style={{ color: '#70002D' }}>Admin</h1>
                <FileUploadComponent onFileUpload={handleFileUpload} />
                {electionRunning === false && <Button variant="contained" className='startElection' onClick={startElection}>Starta röstning</Button>}
                {electionRunning === true && <Button variant="contained" className='endElection' onClick={startElection}>Stoppa röstning</Button>}
                <div style={{ marginBottom: '20px', fontSize: '12px' }}>Vald omröstning: {currentId || 'Ingen vald'} </div>
                {/* {<h3>Välj aktiv omröstning:</h3>}
                {<Button variant="contained" className='nextElection' onClick={nextElection}> Nästa omröstning</Button>}
                {<Button variant="contained" className='previousElection' onClick={previousElection}>Tillbaka</Button>}
 */}
                <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'left', }}>
                    <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                        {snackText}
                    </Alert>
                </Snackbar>

            </div>
            <ElectionTable rows={tableRows} updateParentRows={setTableRows} currentId={currentId || 0} setCurrentId={setCurrentId} password={password} setSelectedElection={setSelectedElection} electionRunning={electionRunning} />
        </div>
    );
};

export default CreateElection;
