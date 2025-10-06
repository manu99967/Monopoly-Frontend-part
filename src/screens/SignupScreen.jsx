// src/screens/SignupScreen.jsx

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

function SignupScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signupUser } = useGame();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await signupUser(username, password);

        if (success) {
            // Redirect to the game setup screen on successful sign-up/login
            navigate('/setup');
        } else {
            // This usually means the username is taken
            setError('Signup failed. Username may already be in use.');
        }
    };

    return (
        <div className="auth-container">
            <h1>Create Account</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Choose Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Choose Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p>
                Already have an account? <a href="/login">Log in here</a>
            </p>
        </div>
    );
}

export default SignupScreen;