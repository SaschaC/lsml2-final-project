// Login 
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import { serverURL } from './config';

import { TextField, Button } from '@material-ui/core';

import axios from 'axios';

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',

    },
    loginContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        width: '400px',
        border: '1px solid black',
        borderRadius: '10px',
    },
    submitButton: {
        marginTop: '20px',
        backgroundColor: '#38a3a5',
        color: 'white',
        width: '200px',
    },
    error: {
        color: 'red',
        fontSize: '12px',
    }
}

export default function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { redirect } = useParams();
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        axios.post(`${serverURL}/api/v1/login`, {
            email: email,
            password: password,
        }).then((response) => {
            console.log(response, 'response');
            let data = response.data;
            localStorage.setItem('token', data.idToken);
            history.push('/home');
        }).catch((error) => {
            console.log(error, 'error', error.response);
            setError(error.response.data.error);
        });
    };

    useEffect(() => {
        if (localStorage.getItem('token')) {
            fetch(`${serverURL}/verify`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    token: localStorage.getItem('token'),
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data, 'data');
                    if (data.error) {
                        setError(data.error);
                    } else {
                        // redirect to home page
                        history.push('/');
                    }
                });
        }
    }, []);


    return (
        <div style={styles.wrapper}>
            <div style={styles.loginContainer}>
                <h1>Login</h1>
                <TextField
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleSubmit}
                    style={styles.submitButton}
                >Login</Button>

                <p
                    style={styles.error}
                >{error}</p>
                <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
        </div>
    );
}