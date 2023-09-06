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
    const [newVoterId, setNewVoterId] = useState("");

    const [removeVoterDialogOpen, setRemoveVoterDialogOpen] = useState(false);
    const [removeVoterId, setRemoveVoterId] = useState("");

    const [permanentDialogOpen, setPermanentDialogOpen] = useState(false);
    const [permanentVoterIds, setPermanentVoterIds] = useState([]);

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

    const [tieDialogOpen, setTieDialogOpen] = useState(false);
    const [tieBreaker, setTieBreaker] = useState(); 

    useEffect(() => {
        getCurrentPart();
        setPassword(props.password);
        const savedArray = sessionStorage.getItem('styr');
        if (savedArray) {
            setPermanentVoterIds(JSON.parse(savedArray));
        }
    }, [props.password]);

    const menuFunctions = {
        setAddVoterDialogOpen,
        setRemoveVoterDialogOpen,
        setRemoveAllDialogOpen,
        setPermanentDialogOpen,
        setTieDialogOpen,
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

        //Add permanentVoterIds(styr) as well: 
        for (let i = 0; i < permanentVoterIds.length; i++) {
            data.push({ "name":"Styr", "voterId": permanentVoterIds[i] });
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
                body: JSON.stringify({ "voterId": newVoterId })
            }).then(response => {
                if (response.ok) {
                    setSeverity('success');
                    setText("Valkod tillagd i server: " + newVoterId);
                    setOpen(true);
                } else {
                    alert("Could not be handled by server. Try again.");
                }
            }).catch(error => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            });
            setNewVoterId("");
        }
    }

    function removeVoter(voterId) {
        if (permanentVoterIds.includes(voterId)){
            setPermanentVoterIds((prevIds) => prevIds.filter((id) => id !== voterId));
            sessionStorage.setItem("styr", JSON.stringify(permanentVoterIds));
        }
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



    function addPermanentIds() {
        cleanPermanentIds();
        sessionStorage.setItem("styr", JSON.stringify(permanentVoterIds));
        try {
            for (let i = 0; i < permanentVoterIds.length; i++) {
                if (permanentVoterIds[i] !== "") {
                    let url = host + "/elections/add-voter/" + password;
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "name":"Styr", "voterId": permanentVoterIds[i] })
                    }).then(response => {
                        if (response.ok) {
                            setSeverity("success");
                            setText("Valkoder har uppdaterats på servern.");
                            setOpen(true);
                        } else {
                            if (!response.body === "Voter already exists") {
                                alert("Could not be handled by server. Try again.");
                            }
                        }
                    }).catch(error => {
                        setSeverity("error");
                        setText("Något gick fel, försök gärna igen.");
                        setOpen(true);
                    });
                }
            }
            setPermanentDialogOpen(false);
        } catch {
            setSeverity("error");
            setText("Något gick fel, försök gärna igen.");
            setOpen(true);
        }
    }

    function cleanPermanentIds() {
        let correctIdsSet = new Set();

        for (let i = 0; i < permanentVoterIds.length; i++) {
            if (permanentVoterIds[i] !== "") {
                correctIdsSet.add(permanentVoterIds[i]);
            }
        }

        let correctIds = Array.from(correctIdsSet);
        setPermanentVoterIds(correctIds);
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

    function setServerTieBreaker(){
        let url = host + "/set-tie-breaker/" + password;
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tieBreaker)
            }).then(response => {
                if (response.ok) {
                    setSeverity('success');
                    setText("Valkod utslagsröst uppdaterades: " + tieBreaker);
                    setOpen(true);
                } else {
                    alert("Could not be handled by server. Try again.");
                }
            }).catch(error => {
                setSeverity("error");
                setText("Något gick fel, försök gärna igen.");
                setOpen(true);
            });
            setTieDialogOpen(false);
    }


    //TESTS
    /* const longPolling = (() => {
        let url = host + '/long-polling-part';
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data === "Omröstning saknas") {
                } else {
                }
                // eslint-disable-next-line
                longPolling();
            })
            .catch((error) => {
                longPolling();
            });
    });

    function castVoteTest(id) {
        let url = host + '/cast-decision-vote/' + id;
        let vote = randomizeJaNej();
        let voteData = JSON.stringify({ "voterId": JSON.stringify(id), "electionPart": "1", "voteType": "Ja/Nej", "vote": vote });
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: voteData,
        })
            .then((response) => {
                if (response.ok) {
                } else {
                    alert('Could not update server data. Try again.');
                }
            })
            .catch((error) => {
                alert('Something went wrong...');
            });

        return vote;

    }

    function randomizeJaNej() {
        // Generate a random number between 0 and 1
        var randomNum = Math.random();

        // Set the options
        var option1 = "Ja";
        var option2 = "Nej";

        // Conditionally choose between the options based on the random number
        var result = randomNum < 0.5 ? option1 : option2;

        return result;
    }

    function addVoterIdsTest(id) {
        let url = host + "/elections/add-voter/" + password;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "voterId": id })
        }).then(response => {
            if (response.ok) {

            } else {
                alert("Could not be handled by server. Try again.");
            }
        }).catch(error => alert("Something went wrong..."));
    }


    async function test() {
        console.log("Test");
        let no = 0;
        let yes = 0;
        for (let i = 1; i <= 490; i++) {
            longPolling();
            //addVoterIdsTest(i);

        }
        await sleep(10000);

        for (let i = 1; i <= 490; i++) {
            let vote = castVoteTest(i);
            if (vote === "Ja") {
                yes++;
            } else {
                no++;
            }
        }

        console.log("RESULT: " + yes + " Ja, " + no + " Nej");

    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    } */




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
                        label="Valkod"
                        value={newVoterId}
                        onChange={(e) => setNewVoterId(e.target.value)}
                        fullWidth
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
                <DialogTitle id="scroll-dialog-title">Alla valkoder</DialogTitle>
                <DialogContent dividers>
                    <DialogContentText
                        id="scroll-dialog-description"
                        tabIndex={-1}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto auto auto auto',
                            columnGap: '30px',
                            rowGap: '10px'
                        }}
                    >
                        {allVoters.length === 0 ? (
                            <div>Inga aktiva valkoder</div>
                        ) : (
                            allVoters.map((item) => (
                                <React.Fragment key={item.voterId}>
                                    <div>{item.name}</div>
                                    <div>{item.voterId}</div>
                                    <div>{item.email}</div>
                                    <Button
                                        style={{ background: '#70002D', height: '25px', color: 'white' }}
                                        onClick={() => {
                                            removeVoter(item.voterId)
                                                .then(() => getAllVoters());
                                        }}
                                    >
                                        Ta bort
                                    </Button>
                                </React.Fragment>
                            ))
                        )}
                    </DialogContentText>

                </DialogContent>
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
            <Dialog open={permanentDialogOpen} onClose={() => setPermanentDialogOpen(false)}>
                <DialogTitle>Valkoder styrelse</DialogTitle>
                <DialogContent>
                <div style={{width:'300px', marginBottom:'20px'}}>OBS: Lägg endast till valkoder här! För att ta bort, gör det i "Ta bort valkod" alt. "Alla valkoder"</div>
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Lägg till valkoder (en per rad)"
                        multiline
                        rows={4}
                        value={permanentVoterIds.join("\n")}
                        onChange={(e) => setPermanentVoterIds(e.target.value.split("\n"))}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPermanentDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={addPermanentIds}>Spara</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={tieDialogOpen} onClose={() => setTieDialogOpen(false)}>
                <DialogTitle>Valkod utslagsröst</DialogTitle>
                <DialogContent>
                <div style={{width:'300px', marginBottom:'20px'}}>Ange den valkod som avgör resultat vid oavgjort (ex. mötesordförande). Obs! Denna kod ska endast läggas in här, den får alltså EJ ingå i gästlistan.   </div>
                    <TextField
                        style={{ marginTop: '10px' }}
                        label="Ange valkod"
                        value={tieBreaker}
                        onChange={(e) => setTieBreaker(e.target.value)}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTieDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={setServerTieBreaker}>Spara</Button>
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
                    <p>Är du säker på att du vill skicka alla valkoder?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSendAllRemailsDialogOpen(false)}>Avbryt</Button>
                    <Button onClick={sendAllEmails}>Skicka</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={removeAllDialogOpen} onClose={() => setRemoveAllDialogOpen(false)}>
                <DialogTitle>Ta bort alla valkoder</DialogTitle>
                <DialogContent>
                    <p>Är du säker på att du vill ta bort alla valkoder?</p>
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
        </div>
    );
};

export default CreateElection;
