import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; 
import { getFirestore, doc, getDoc,setDoc} from 'firebase/firestore'; 
import './loginform.css';
import img1 from './dycimages/googleicon.png';
import successPopup from "./dashboardhome/iconshomepage/successPopup.png";
import errorPopup from "./dashboardhome/iconshomepage/errorPopup.png";

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        const savedEmail = localStorage.getItem('email');
        const savedPassword = localStorage.getItem('password');
        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
    }, []);

    useEffect(() => {
        let timer;
        if (countdown !== null && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            navigate('/dashboard');
        }
        return () => clearInterval(timer);
    }, [countdown, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const startCountdownAndNavigate = () => {
        setCountdown(5);
    };

    const closeErrorPopup = () => {
        setShowErrorPopup(false);
        setErrorMessage('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            if (!user.emailVerified) {
                setErrorMessage("Please verify your email before logging in.");
                setShowErrorPopup(true);
                setIsLoading(false);
                return;
            }
    
            if (keepLoggedIn) {
                localStorage.setItem('email', email);
                localStorage.setItem('password', password);
            } else {
                localStorage.removeItem('email');
                localStorage.removeItem('password');
            }
    
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                localStorage.setItem('firstName', userData.firstName);
                localStorage.setItem('userPicture', userData.userPicture);
                startCountdownAndNavigate();
            }
        } catch (error) {
            setErrorMessage('Error logging in: ' + error.message);
            setShowErrorPopup(true);
            setIsLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Check if user already exists in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                // User exists, proceed to login
                const userData = userDoc.data();
                localStorage.setItem('firstName', userData.firstName);
                localStorage.setItem('userPicture', userData.userPicture);
                startCountdownAndNavigate();  // Navigate to the dashboard after login
            } else {
                // User doesn't exist, create a new document
                await setDoc(userDocRef, {
                    firstName: user.displayName.split(' ')[0].toUpperCase(),
                    lastName: user.displayName.split(' ')[1]?.toUpperCase() || '',
                    email: user.email,
                    uid: user.uid,
                    userPicture: user.photoURL ||"https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Fdefaultpic.png?alt=media&token=d6fcd468-c496-4c72-a83e-142290ce2cd5"
                });
                
                // Log the user in after registration
                localStorage.setItem('firstName', user.displayName.split(' ')[0].toUpperCase());
                localStorage.setItem('userPicture', user.photoURL || "https://firebasestorage.googleapis.com/v0/b/dyci-academix.appspot.com/o/wagdelete%2Fdefaultpic.png?alt=media&token=d6fcd468-c496-4c72-a83e-142290ce2cd5");
                startCountdownAndNavigate();  // Navigate to the dashboard after registration
            }
        } catch (error) {
            setErrorMessage('Error logging in with Google: ' + error.message);
            setShowErrorPopup(true);
            setIsLoading(false);
        }
    };
    

    return (
        <div className="formwrapper">
            {(isLoading || countdown !== null) && (
                <div className="unique-spinner">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            )}


            {showErrorPopup && (
                <div className="signin-popup-overlay">
                    <div className="signin-popup-modal">
                        <img src={errorPopup} alt="Error" className="signin-popup-icon" />
                        <p className="signin-popup-error-message">{errorMessage}</p>
                        <button 
                            className="signin-popup-error-button"
                            onClick={closeErrorPopup}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            
            <div className="login-container">
                <svg xmlns="http://www.w3.org/2000/svg" className="svgLogin" viewBox="0 0 1440 320">
                    <path fill="#F7FBFC" fillOpacity="1" d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,69.3C672,21,768,11,864,58.7C960,107,1056,213,1152,250.7C1248,288,1344,256,1392,240L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
                <h1 className="form-title">Log in to your Account</h1>

                <div className="social-login">
                    <img src={img1} alt="" className="social-icon" />
                    <button className="social-button" onClick={handleGoogleLogin}>Log in with Google</button>
                </div>

                <p className="separator"><span className="loginseparate">OR LOGIN WITH Email</span></p>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-wrapper">
                        <i className="material-symbols-outlined inpution">mail</i>
                        <input 
                            type="email" 
                            placeholder="Enter Email" 
                            id="email" 
                            className="input-field" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-wrapper">
                        <i className="material-symbols-outlined inpution">lock</i>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Enter Password" 
                            id="Loginpassword" 
                            className="input-field" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <i className="material-symbols-outlined input_icon toggle-password" onClick={togglePasswordVisibility}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </i>
                    </div>

                   {/* <div>
                        <input 
                            type="checkbox" 
                            id="keeplogin" 
                            className="keepcheckbox" 
                            checked={keepLoggedIn} 
                            onChange={() => setKeepLoggedIn(!keepLoggedIn)} 
                        />
                        <label htmlFor="keeplogin" className="keeplogcheck"> Keep me logged in</label>
                    </div>
                    */}

                    <Link to="/forgotpassword" className="forgotlink">Forgot Password?</Link>

                    <button className="login-button" id="login-button">Login</button>
                </form>

                <p className="signupQ">Don't have an account yet? <Link to="/signupform" className="signuptextlink">Signup</Link></p>

                <p className="version1">Version 1.0</p>
            </div>
        </div>
    );
};

export default LoginForm;