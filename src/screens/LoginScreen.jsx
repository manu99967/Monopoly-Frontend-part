// src/screens/LoginScreen.jsx

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useNavigate, Link } from 'react-router-dom'; // 🔑 Import Link

function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser } = useGame();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await loginUser(username, password);

        if (success) {
            navigate('/setup');
        } else {
            setError('Login failed. Check your username and password.');
        }
    };

    return (
        // 🔑 auth-wrapper: Centered, full screen background
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4"> 
            
            {/* 🔑 auth-container: Card box styling */}
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                
                {/* auth-title */}
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
                    Monopoly Login
                </h1>
                
                {/* auth-form */}
                <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                    
                    {/* Input kwa Username */}
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        // 🔑 auth-input styling
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                    
                    {/* Input kwa Password */}
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        // 🔑 auth-input styling
                        className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                    
                    {/* Button kwa Log In */}
                    <button 
                        type="submit" 
                        // 🔑 auth-button styling
                        className="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
                    >
                        Log In
                    </button>
                </form>
                
                {/* error-message */}
                {error && <p className="text-red-500 text-sm mt-3 text-center font-medium">{error}</p>}
                
                {/* auth-footer */}
                <p className="text-sm text-gray-600 mt-6 text-center">
                    Don't have an account? 
                    <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
                        Sign up here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginScreen;