import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import './Voting.css';
import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function Voting(props) {
    const host = 'http://localhost:8080';
    const [hasVoted, setHasVoted] = useState(false);
    const [currentElectionId, setElectionId] = useState(props.current.id);
    const [personVotes, setPersonVotes] = useState([]);
    const [open, setOpen] = useState(false); //Success message
    const [changeVoteOpen, setChangeOpen] = useState(false);
    const [snackText, setText] = useState("");

    const handleCandidateSelection = (event, candidateIndex) => {
        const selectedCandidate = event.target.value;
        const updatedVotes = [...personVotes];

        if (selectedCandidate === 'Vakant') {
            updatedVotes[candidateIndex] = 'Vakant';
        } else if (selectedCandidate === 'Blankt') {
            updatedVotes[candidateIndex] = 'Blankt';

        } else {
            // Check for duplicate selection
            if (updatedVotes.includes(selectedCandidate)) {
                // Candidate is already selected, show an error or handle it accordingly
                setText("Kandidat redan vald, vänligen välj en annan");
                setOpen(true);
                return;
            }

            updatedVotes[candidateIndex] = selectedCandidate;
        }

        setPersonVotes(updatedVotes);
    };


    function buttonClick(event) {
        setElectionId(props.current.id);
        setHasVoted(false);
        if (event.target.value === 'changeVote') {
            setChangeOpen(true);
            setText("Din tidigare röst behålls tills du valt ett nytt alternativ");
            setHasVoted(false);
        } else if (event.target.value === 'Ja' || event.target.value === 'Nej') {
            const voteData = JSON.stringify({
                voterId: props.voterId,
                electionPart: props.current.id.toString(),
                voteType: 'Ja/Nej',
                vote: event.target.value,
            });
            castDecisionVote(voteData);
        } else if (event.target.value === 'Personval') {
            const voteData = JSON.stringify({
                voterId: props.voterId,
                electionPart: props.current.id.toString(),
                voteType: 'Personval',
                vote: personVotes,
            });
            castPersonVote(voteData);
        } else if (event.target.value === 'alternative1') {
            const voteData = JSON.stringify({
                voterId: props.voterId,
                electionPart: props.current.id.toString(),
                voteType: 'Flerval',
                vote: props.current.alternative1,
            });
            castMultipleVote(voteData);
        } else if (event.target.value === 'alternative2') {
            const voteData = JSON.stringify({
                voterId: props.voterId,
                electionPart: props.current.id.toString(),
                voteType: 'Flerval',
                vote: props.current.alternative2,
            });
            castMultipleVote(voteData);
        }
    }

    function castDecisionVote(voteData) {
        let url = host + '/cast-decision-vote/' + props.voterId;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: voteData,
        })
            .then((response) => {
                if (response.ok) {
                    setHasVoted(true);
                } else {
                    alert('Din röst kunde inte hanteras. Dubbelkolla valkod och testa igen. Om problemet fortsätter, uppdatera sidan.');
                    setHasVoted(false);
                }
            })
            .catch((error) => {
                console.log(error);
                alert('Något gick fel... Kontakta admin.');
                setHasVoted(false);
            });
    }

    function castPersonVote(voteData) {
        let url = host + '/cast-person-vote/' + props.voterId;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: voteData,
        })
            .then((response) => {
                if (response.ok) {
                    setHasVoted(true);
                    setPersonVotes([]);
                } else {
                    alert('Din röst kunde inte hanteras. Dubbelkolla valkod och testa igen. Om problemet fortsätter, uppdatera sidan.');
                    setHasVoted(false);
                }
            })
            .catch((error) => {
                console.log(error);
                alert('Något gick fel... Kontakta admin');
                setHasVoted(false);
            });
    }

    function castMultipleVote(voteData) {
        let url = host + '/cast-multiple-vote/' + props.voterId;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: voteData,
        })
            .then((response) => {
                if (response.ok) {
                    setHasVoted(true);
                } else {
                    alert('Din röst kunde inte hanteras. Dubbelkolla valkod och testa igen. Om problemet fortsätter, uppdatera sidan.');
                    setHasVoted(false);
                }
            })
            .catch((error) => {
                console.log(error);
                alert('Något gick fel... Kontakta admin.');
                setHasVoted(false);
            });
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleChangeClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setChangeOpen(false);
    };


    if (hasVoted === true && props.current.id === currentElectionId) {
        return (
            <div className='main'>
                <div className='centerDecision'>
                    <h1 className='title'>{props.current.title}</h1>
                    <h3 style={{ color: 'green' }}>Du har röstat</h3>
                    <Button variant='contained' value='changeVote' className='changeVoteButton' onClick={buttonClick}>
                        Ändra din röst
                    </Button>
                </div>
            </div>
        );
    } else if (props.current.type === 'Ja/Nej') {
        return (
            <div className='main'>
                <Snackbar
                    open={changeVoteOpen}
                    autoHideDuration={5000}
                    onClose={handleChangeClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    <Alert onClose={handleChangeClose} severity='info' sx={{ width: '100%', background: 'white' }}>
                        {snackText}
                    </Alert>
                </Snackbar>
                <div className='centerDecision'>
                    <h1 className='title'>{props.current.title}</h1>
                    <Button variant='contained' value='Ja' className='choiceButton' onClick={buttonClick}>
                        Ja
                    </Button>
                    <Button variant='contained' value='Nej' className='choiceButton' onClick={buttonClick}>
                        Nej
                    </Button>
                </div>
            </div>
        );
    } else if (props.current.type === 'Flerval') {
        console.log(props.current);
        return (
            <div className='main'>
                <Snackbar
                    open={changeVoteOpen}
                    autoHideDuration={5000}
                    onClose={handleChangeClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    <Alert onClose={handleChangeClose} severity='info' sx={{ width: '100%', background: 'white' }}>
                        {snackText}
                    </Alert>
                </Snackbar>
                <div className='centerDecision'>
                    <h1 className='title'>{props.current.title}</h1>
                    <Button variant='contained' value='alternative1' className='choiceButton2' onClick={buttonClick}>
                        {props.current.alternative1}
                    </Button>
                    <Button variant='contained' value='alternative2' className='choiceButton2' onClick={buttonClick}>
                        {props.current.alternative2}
                    </Button>
                </div>
            </div>
        );
    } else if (props.current.type === 'Personval') {
        if (props.current.candidates.length <= 6) {
            return (
                <div>
                    <Snackbar
                        open={changeVoteOpen}
                        autoHideDuration={5000}
                        onClose={handleChangeClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                        <Alert onClose={handleChangeClose} severity='info' sx={{ width: '100%', background: 'white' }}>
                            {snackText}
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={open}
                        autoHideDuration={5000}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                        <Alert onClose={handleClose} severity='warning' sx={{ width: '100%', background: 'white' }}>
                            {snackText}
                        </Alert>
                    </Snackbar>
                    <div className='main'>
                        <div className='center'>
                            <h1 className='title'>{props.current.title}</h1>
                            {props.current.candidates.map((candidate, index) => (
                                <Select
                                    displayEmpty
                                    className='select'
                                    key={index}
                                    value={personVotes[index] || ''}
                                    onChange={(event) => handleCandidateSelection(event, index)}
                                >
                                    <MenuItem value='' disabled>
                                        Rank {index + 1}
                                    </MenuItem>
                                    {props.current.candidates.map((candidate, index) => (
                                        <MenuItem key={index} value={candidate}>
                                            {candidate}
                                        </MenuItem>
                                    ))}
                                    <MenuItem value='Vakant' style={{ color: 'blue' }}>
                                        Vakant
                                    </MenuItem>
                                    <MenuItem value='Blankt' style={{ color: 'blue' }}>
                                        Blankt
                                    </MenuItem>
                                </Select>
                            ))}
                            <Button variant='contained' value='Personval' className='sendVoteButton' onClick={buttonClick}>
                                Skicka röst
                            </Button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <Snackbar
                        open={changeVoteOpen}
                        autoHideDuration={5000}
                        onClose={handleChangeClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                        <Alert onClose={handleChangeClose} severity='info' sx={{ width: '100%', background: 'white' }}>
                            {snackText}
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={open}
                        autoHideDuration={5000}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                        <Alert onClose={handleClose} severity='warning' sx={{ width: '100%', background: 'white' }}>
                            {snackText}
                        </Alert>
                    </Snackbar>
                    <div className='mainMoreThanSix'>
                        <div className='centerMoreThanSix'>
                            <h1 className='title'>{props.current.title}</h1>
                            {props.current.candidates.map((candidate, index) => (
                                <Select
                                    displayEmpty
                                    className='select'
                                    key={index}
                                    value={personVotes[index] || ''}
                                    onChange={(event) => handleCandidateSelection(event, index)}
                                >
                                    <MenuItem value='' disabled>
                                        Rank {index + 1}
                                    </MenuItem>
                                    {props.current.candidates.map((candidate, index) => (
                                        <MenuItem key={index} value={candidate}>
                                            {candidate}
                                        </MenuItem>
                                    ))}
                                    <MenuItem value='Vakant' style={{ color: 'blue' }}>
                                        Vakant
                                    </MenuItem>
                                    <MenuItem value='Blankt' style={{ color: 'blue' }}>
                                        Blankt
                                    </MenuItem>
                                </Select>
                            ))}
                            <Button variant='contained' value='Personval' className='sendVoteButton' onClick={buttonClick}>
                                Skicka röst
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default Voting;