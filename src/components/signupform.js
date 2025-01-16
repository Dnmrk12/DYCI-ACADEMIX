import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, collection, setDoc, doc } from './firebase/firebaseConfig';
import './signupform.css';
import img1 from './dycimages/googleicon.png';
import successPopup from "./dashboardhome/iconshomepage/successPopup.png";
import errorPopup from "./dashboardhome/iconshomepage/errorPopup.png";

const Signupform = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState("");
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        let timer;
        if (countdown !== null && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const closeSuccessPopup = () => {
        setShowSuccessPopup(false);
        setCountdown(null); // Reset countdown to stop the loading spinner
    };

    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setErrorMessage('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            setShowErrorPopup(true);
            setIsLoading(false);
            return;
        }
    
        const auth = getAuth();
    
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            await sendEmailVerification(user);
    
            await setDoc(doc(db, 'users', user.uid), {
                firstName: firstName.toUpperCase(),
                lastName: lastName.toUpperCase(),
                email: email,
                uid: user.uid,
                userPicture: "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Fdefaultpic.png?alt=media&token=d6fcd468-c496-4c72-a83e-142290ce2cd5"
            });
    
            setSuccessMessage("Account created successfully! Please verify your email.");
            setShowSuccessPopup(true);
            setCountdown(5);
    
            // Reset form
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (authError) {
            setErrorMessage(authError.message);
            setShowErrorPopup(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignup = async () => {
        setIsLoading(true);
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
    
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            await setDoc(doc(db, 'users', user.uid), {
                firstName: user.displayName.split(' ')[0].toUpperCase(),
                lastName: user.displayName.split(' ')[1]?.toUpperCase() || '',
                email: user.email,
                uid: user.uid,
                userPicture: "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/received_611513854553082.png?alt=media&token=2c2a0f36-8902-4dd6-b10f-f1d2c996f1b5"
            });
    
            setSuccessMessage("Account created successfully!");
            setShowSuccessPopup(true);
            setCountdown(5);
        } catch (error) {
            setErrorMessage(error.message);
            setShowErrorPopup(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-wrapper-signup">
            {(isLoading || countdown !== null) && (
                <div className="signup-spinner">
                    <div className="signup-dot"></div>
                    <div className="signup-dot"></div>
                    <div className="signup-dot"></div>
                </div>
            )}

{showSuccessPopup && (
    <div className="signup-popup-overlay">
        <div className="signup-popup-modal">
            <img src={successPopup} alt="Success" className="signup-popup-icon" />
            <p className="signup-popup-message">{successMessage}</p>
            <button 
                className="signup-popup-button"
                onClick={closeSuccessPopup}
            >
                OK
            </button>
        </div>
    </div>
)}


            {showErrorPopup && (
                <div className="signup-popup-overlay">
                    <div className="signup-popup-modal">
                        <img src={errorPopup} alt="Error" className="signup-popup-icon" />
                        <p className="signup-popup-error-message">{errorMessage}</p>
                        <button 
                            className="signup-popup-error-button"
                            onClick={closeErrorPopup}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Rest of the form JSX remains the same */}
            <div className="signup-container">
                <form onSubmit={handleSignup} className="signup-form">
                    <svg xmlns="http://www.w3.org/2000/svg" className="svgSignup" viewBox="0 0 1440 320">
                        <path fill="#F7FBFC" fillOpacity="1" d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,69.3C672,21,768,11,864,58.7C960,107,1056,213,1152,250.7C1248,288,1344,256,1392,240L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    <h1 className="titleform">Create an Account</h1>
                 {/* 
                    <div className="sociallogin">
                        <img src={img1} alt="Google Icon" className="socialicon" />
                        <button type="button" className="socialbutton" onClick={handleGoogleSignup}>Sign up with Google</button>
                    </div>

                    <p className="separator panghati"><span className="nameseparate">OR SIGN UP WITH Email</span></p>
*/}


                   
                    <div className="inputname">
                        <input
                            type="text"
                            placeholder="First Name"
                            id="Fname"
                            className="inputFirstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="inputname">
                        <input
                            type="text"
                            placeholder="Last Name"
                            id="Lname"
                            className="inputLastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-wrapper">
                        <i className="material-symbols-outlined iconinput iconenvelope">mail</i>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            id="email"
                            className="fieldinput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-wrapper">
                        <i className="material-symbols-outlined iconinput iconsignup">lock</i>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter Password"
                            id="Signuppassword"
                            className="passwordinput"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i className="material-symbols-outlined iconinput toggelpassword" onClick={togglePasswordVisibility}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </i>
                    </div>

                    <div className="input-wrapper">
                        <i className="material-symbols-outlined iconinput iconsignup">lock</i>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            id="Signupconfirmpassword"
                            className="confirminput"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <i className="material-symbols-outlined iconinput toggelpassword" onClick={toggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </i>
                    </div>

                    <button type="submit" className="signup-button">Sign Up</button>
                </form>

                <p className="signtext">Already have an Account? <Link to="/">Login</Link></p>
                <p className="signupver">Version 1.0</p>
            </div>
        </div>
    );
};

export default Signupform;