import React, { useEffect, useState } from 'react';
import FileUploadComponent from './FileUploadComponent';
import './AdminPanel.css';
import Menu from './Menu.js';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
    const host = "https://vote-server.isek.se";

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

    const [wixDialogOpen, setWixDialogOpen] = useState(false);
    const [eventUrl, setEventUrl] = useState("");
    const [wixUrlSlug, setWixUrlSlug] = useState("");

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
        setWixDialogOpen
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

    function refreshFromWix() {
        let slug = wixUrlSlug;
        if (slug === ("")) {
            alert("Du måste ange URL till eventet i menuvalet \"Wix\" först.")
        } else {
            console.log(slug);

            let retrieveEventUrl = "https://www.wixapis.com/events/v1/events/event?slug=" + slug; 
            let headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", "IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcImRkYTU0ZTE5LWVkMmItNDJmMC1hYTU0LWUyOWNkNjYwMThjYVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcImY3NzllMTI1LTVjMjMtNGViNS1hM2FlLWIwYTBlNTA5YzZiMlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCI3OWVlMWQ5Yy0xNDU3LTRlOTEtODNkMS05NjljMjNiMWRlMzJcIn19IiwiaWF0IjoxNzAyMDQ1MTgxfQ.QgI1ho7WFBs_rzipLbtm1QihX94e3G64J4aYISNjfrZWVplC4Liqr4MloIpA72lQ_SU8MjaM51Yqj1SoGrfxnZhIzRyw9kKAJXdBGIGSxvUqbi6YcWeyPtzYnI1UdNEGsKJioK6rD-2bmxQvDIoKX7swDGSGpwE8X58ZnR05Nn-TMA6Z58Jj7hMoOw9fao1ZBcBA0LEI5_YsBKSQq66Jd8mZ0t9EBws-BlcQ1gN40-2WZ88EOUpn2_GBTIKqRhKRvCyfshAQ_VbZ75gnS5tco3zeHdYzLEwmFuPnkKRQS6yszWB7vPhfr3vDMxeNhyBvPhS_s4uFbYqxGpKiUJkWjg");
            headers.append("wix-account-id", "79ee1d9c-1457-4e91-83d1-969c23b1de32");
            headers.append("wix-site-id", "10931ecf-bcec-4203-9a8a-df44a225b0d2")
            fetch(retrieveEventUrl, {
                method: "GET",
                headers: headers,
              })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    setSeverity("error");
                    setText("Något gick fel, försök gärna igen.");
                    setOpen(true);
                }
            }).then((data) => {
                console.log(data);
            })
            .catch((error) => {
                setSeverity("error");
                setText("Något gick fel, kontrollera URL och försök igen.");
                setOpen(true);
            });

        }
    }

    function changeWixUrlSlug() {
        let url = eventUrl;
        let segments = url.split('/');
        let lastSegment = segments[segments.length - 1];

        console.log(lastSegment);
        setWixUrlSlug(lastSegment);
    }

    function removeCheckInWix() {
        let slug = wixUrlSlug;
        if (slug === ("")) {
            alert("Du måste ange URL till eventet i menuvalet \"Wix\" först.")
        } else {
            console.log(slug);
        }
    }
    const handleFileUpload = async (file) => {
        const contents = await readFileAsText(file);
        const parsedData = parseCsvData(contents);
        updateVoters(parsedData); // Pass the parsed data to the updateVoters function
        console.log(parsedData);

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
        let url = host + "/set-current-part/" + password;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                setCurrentId(1);
                updateCurrentId(1);
            } else {
                updateCurrentId(currentId);
            }
        } else {
            updateCurrentId(0);
        }
        setRunning(electionRunning => !electionRunning);
    };

    function nextElection(event) {
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
    }

    function updateVoters(parsedData) {
        let url = host + "/elections/update-voters/" + password;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
        let url = host + "/elections/update-roles/" + password;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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

            let url = host + "/elections/add-voter/" + password;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
                let url = host + "/elections/remove-voter/" + password;
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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
        let url = host + '/send-emails/' + password;
        setShowLoading(true);
        fetch(url)
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
        let url = host + "/send-single-email/" + password;
        setShowLoading(true);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
        let url = host + "/send-single-email/" + password;
        setShowLoading(true);

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
            let url = host + "/update-password/" + password;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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
        let url = host + '/remove-all-voters/' + password;
        fetch(url)
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
        let url = host + '/get-all-voters/' + password;
        fetch(url)
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
                            right: '10px',
                            cursor: 'pointer',
                            marginTop: '10px', // Added margin-top to vertically align with QuestionMarkIcon
                            marginBottom: '5px'
                        }}
                    />
                    <DialogTitle id="scroll-dialog-title" style={{ marginBottom: '35px' }}>Alla valkoder</DialogTitle>
                    <div style={{ position: 'absolute', left: '20px', top: '70px', display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#70002D' }} onClick={refreshFromWix}>
                        <RefreshIcon
                            style={{
                                cursor: 'pointer',
                                textSize: '10px'
                            }}
                        />
                        <div style={{ marginLeft: '5px', marginRight: '10px' }}>Uppdatera från Wix</div>
                    </div>
                    <div style={{ position: 'absolute', top: '70px', right: '20px', color: '#70002D', cursor: 'pointer' }} onClick={removeCheckInWix}>Checka ut alla på Wix</div>
                    <DialogContent dividers style={{ marginTop: '30px' }}>
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


                        </DialogContentText>
                    </DialogContent>
                </div>
            </Dialog >
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
            <Dialog open={wixDialogOpen} onClose={() => setWixDialogOpen(false)}>
                <DialogTitle>Wix</DialogTitle>
                <DialogContent>
                    <div style={{ marginBottom: '10px' }}>Ange url till eventet i Wix, till exempel: <br></br> https://www.isek.se/event-details/ht-mote-2023</div>
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="URL"
                        value={eventUrl}
                        onChange={(e) => setEventUrl(e.target.value)}
                        fullWidth
                    />
                    <Button onClick={changeWixUrlSlug}>Spara</Button>

                    <div style={{ marginTop: '30px', fontWeight: 'bold' }}>Funktioner:</div>
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#70002D', marginTop: '15px', fontWeight: 'bold' }} onClick={refreshFromWix}>

                        <RefreshIcon
                            style={{
                                cursor: 'pointer',
                                textSize: '10px'
                            }}
                        />
                        <div>Uppdatera gästlista från Wix</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#70002D', marginTop: '15px', fontWeight: 'bold' }} onClick={removeCheckInWix}>

                        <DeleteOutlineIcon
                            style={{
                                cursor: 'pointer',
                                textSize: '10px'
                            }}
                        />
                        <div>Ta bort check-ins från Wix</div>
                    </div>
                </DialogContent>
            </Dialog>
            <div className='frame'>
                <h1 style={{ color: '#70002D' }}>Admin</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center' }}>
                    <h5 style={{ marginRight: '10px', marginLeft: '55px' }}>Ladda upp gästlista</h5>
                    <FileUploadComponent onFileUpload={handleFileUpload} />
                </div>
                {electionRunning === false && <Button variant="contained" className='startElection' onClick={startElection}>Starta röstning</Button>}
                {electionRunning === true && <Button variant="contained" className='endElection' onClick={startElection}>Stoppa röstning</Button>}
                {<h3>Välj aktiv omröstning:</h3>}
                {<Button variant="contained" className='nextElection' onClick={nextElection}> Nästa omröstning</Button>}
                {<Button variant="contained" className='previousElection' onClick={previousElection}>Tillbaka</Button>}

                <Snackbar open={open} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'left', }}>
                    <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                        {snackText}
                    </Alert>
                </Snackbar>

            </div>
            <ElectionTable rows={tableRows} updateParentRows={setTableRows} currentId={currentId || 0} password={password} />
        </div >
    );
};

export default CreateElection;
