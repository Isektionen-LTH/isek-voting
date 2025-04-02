import './AdminLogin.css'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import CreateElection from './AdminPanel';

function AdminLogin() {
    const [fieldInput, setInput] = useState('');
    const [isLoggedIn, setLoggedIn] = useState(false); // New state variable to track login status
    const [isWrongPassword, setWrongPassword] = useState(false); // New state variable to track wrong password status

    function handleSubmit(event) {
        event.preventDefault();
        let url = 'https://vote-server.isek.se/validate-admin';
        let headers = {
            'Authorization': 'Basic ' + btoa(fieldInput) // Use btoa to encode the password
        };
        fetch(url, { headers })
            .then((response) => {
                if (response.ok) {
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                    setWrongPassword(true);
                }
            })
            .catch((error) => {
                alert("Something wrong..." + error);
                setWrongPassword(true);
            });
    }

    function handleChange(event) {
        setInput(event.target.value);
    }

    if (isLoggedIn) {
        return <CreateElection password={fieldInput} setPassword={setInput} />; // Render the other component if logged in
    } else {
        return (
            <div className='frameLogin'>
                <form onSubmit={handleSubmit}>
                    <div className='content'>
                        <h1 className='textLogin'>Admin</h1>
                        <TextField required type="password" label="Lösenord" variant="outlined" className='inputLogin' value={fieldInput} onChange={handleChange} error={isWrongPassword} helperText={isWrongPassword ? 'Wrong password' : ''}></TextField>
                        <Button type='submit' variant="contained" className='buttonLogin' onSubmit={handleSubmit}>Logga in</Button>
                    </div>
                </form>
            </div>
        );
    }
}


export default AdminLogin;
