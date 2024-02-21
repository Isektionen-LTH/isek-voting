import './VoteClient.css';
import image from '../logo.png';
import { useEffect, useState, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Voting from './Voting';

function VoteClient(params) {
    const [fieldInput, setInput] = useState('');
    // eslint-disable-next-line
    const [currentElection, setCurrent] = useState(null);
    const [voterId, setVoterId] = useState('');
    const [voterName, setVoterName] = useState('');
    const [isWrongId, setWrongId] = useState(false);
    const [isLoggedOut, setiIsLoggedOut] = useState(false);
    const host = "http://192.168.32.3:8080";


    const longPolling = useCallback(() => {
        let url = host + '/long-polling-part';
        fetch(url, {
            headers: {
                voterId: voterId
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data === "Omröstning saknas") {
                    setCurrent(null);
                    // eslint-disable-next-line
                    longPolling();
                } else if (data === 'No voter with that id') {
                    setiIsLoggedOut(true); //Logged out
                } else {
                    setCurrent(data);
                    // eslint-disable-next-line
                    longPolling();
                }
            })
            .catch((error) => {
                setCurrent(null);
                longPolling();
            });
    }, [voterId]);

    function getCurrentPart() {
        let url = host + '/get-current-part';
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data === 0) {
                    setCurrent(null);
                } else {
                    setCurrent(data);
                }
            })
            .catch((error) => {
                console.log(error);
                setCurrent(null);
            });
    }

    function validateVoter(id) {
        let url = host + '/validate-voter';
        fetch(url, {
            headers: {
                voterId: id
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data === "No voter with that id") {
                    setWrongId(true);
                } else {
                    setVoterId(fieldInput);
                    setVoterName(data);
                    sessionStorage.setItem('voterId', fieldInput);
                    setiIsLoggedOut(false);
                }
            })
            .catch((error) => {
                setWrongId(true);
            });
    }

    useEffect(() => {
        //Get params from url, see index.js
        if (params.id) {
            setInput(params.id);
        }
        getCurrentPart();
        if (voterId) {
            longPolling();
        }
        if (sessionStorage.getItem('voterId') !== null) {
            setInput(sessionStorage.getItem('voterId'));
        }
        // eslint-disable-next-line
    }, [voterId]);

    function noCurrentElection() {
        return (
            <div className='mainFrame'>
                <h1 className='text'>Välkommen,<br></br>{voterName}</h1>
                <p className='text2'>Just nu pågår det ingen omröstning.</p>
                <img src={image} alt="ISEK" className='logo' />
            </div>
        );
    }

    function loggedOut() {
        return (
            <div className='mainFrame'>
                <h1 className='text'>Valkod ej giltig<br></br></h1>
                <p className='text2'>Din valkod är inte längre aktiv. Meddela styr om du är kvar på mötet.</p>
                <img src={image} alt="ISEK" className='logo' />
            </div>
        );
    }

    function handleSubmit(event) {
        event.preventDefault();
        validateVoter(fieldInput);
    }

    function handleChange(event) {
        event.preventDefault();
        setInput(event.target.value);
    }

    if (isLoggedOut) {
        return (
            <div>
                <p className='valkod'>Valkod: {voterId} ({voterName})</p>
                {loggedOut()}
            </div>
        );
    } else if (voterId === '') {
        return (
            <div className='frameVoter'>
                <form onSubmit={handleSubmit}>
                    <div className='contentVoter'>
                        <h1 className='textVoter'>Ange valkod</h1>
                        <TextField required label="Valkod" variant="outlined" className='inputVoter' value={fieldInput} onChange={handleChange} error={isWrongId} helperText={isWrongId ? 'Valkod finns ej.' : ''}></TextField>
                        <Button type='submit' variant="contained" className='buttonVoter' onSubmit={handleSubmit}>Logga in</Button>
                    </div>
                </form>
            </div>
        );
    } else if (currentElection === null) {
        return (
            <div>
                <p className='valkod'>Valkod: {voterId} ({voterName})</p>
                {noCurrentElection()}
            </div>
        );
    } else {
        return (
            <div>
                <p className='valkod'>Valkod: {voterId} ({voterName})</p>
                <Voting current={currentElection} voterId={voterId} />
            </div>
        );
    }
}

export default VoteClient;
