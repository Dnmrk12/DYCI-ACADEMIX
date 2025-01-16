import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Import Firebase methods
import Swal from 'sweetalert2'; // Import SweetAlert
import './forgotpassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();

    const handleResetPassword = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        try {
            await sendPasswordResetEmail(auth, email); // Send password reset email
            
            // Display success message using SweetAlert
            await Swal.fire({
              
                title: 'Email Sent!',
                text: 'Check your email for the password reset instructions.',
                confirmButtonText: 'OK',
                backdrop: true, // Ensure the backdrop doesn't affect layout
                allowOutsideClick: false, // Prevent accidental click dismiss
                heightAuto: false // Avoid auto height adjustments
            });

            setError(''); // Clear any previous error messages
            setEmail(''); // Clear email input
        } catch (err) {
            console.error('Error sending password reset email:', err);
            setError('Error: ' + err.message); // Set error message

            // Display error message using SweetAlert
            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.message,
                confirmButtonText: 'OK'
            });
        }
    };

    return (
        <div className="forgotpasswrapper">
            <div className="forgotpasscontainer">
                <svg xmlns="http://www.w3.org/2000/svg" className="svgforgotpassword" viewBox="0 0 1440 320">
                    <path fill="#F7FBFC" fillOpacity="1" d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,69.3C672,21,768,11,864,58.7C960,107,1056,213,1152,250.7C1248,288,1344,256,1392,240L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
                <h1 className="forgotpasswordtitle">Forgot Password</h1>

                <div className="forgotpasswordmessage">
                    <p>Enter the DYCI email address you used to create the account, and we will email you instructions to reset your password.</p>
                </div>

                {error && <p className="error-message">{error}</p>}

                <form action="#" className="login-form" onSubmit={handleResetPassword}>
                    <div className="inputwrap">
                        <i className="material-symbols-outlined inputcon">mail</i>
                        <input 
                            type="email" 
                            placeholder="Enter Email" 
                            id="forgotpass" 
                            className="forgotpasswordfield" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit" className="confirmbutton" id="confirmbutton">Confirm</button>
                </form>

                <p className="forgot-text">Don't have an account yet? <Link to="/signupform" className="forgotpasswordtext">Signup</Link></p>

                <p className="version">Version 1.0</p>
            </div>
        </div>
    );
};

export default ForgotPassword;
