import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './resetpass.css';


const ResetPass = () => {
    const navigate = useNavigate();
     // State for password visibility
     const [showPassword, setShowPassword] = useState(false);
     // State for confirm password visibility
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 
     // Function to toggle password visibility
     const togglePasswordVisibility = () => {
         setShowPassword(!showPassword);
     };
 
     // Function to toggle confirm password visibility
     const toggleConfirmPasswordVisibility = () => {
         setShowConfirmPassword(!showConfirmPassword);
     };

    return (
        <div className="reset-wrapper">
            <div className="resetpass-container">
            <svg xmlns="http://www.w3.org/2000/svg" className="svgReset" viewBox="0 0 1440 320"><path fill="#F7FBFC" fill-opacity="1" d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,69.3C672,21,768,11,864,58.7C960,107,1056,213,1152,250.7C1248,288,1344,256,1392,240L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                <h1 className="ResetTitle">Reset your Password</h1>

                
                <form action="#" className="resetform">
                    

                    <div className="reset-input-wrapper">
                        <i className="material-symbols-outlined iconreeset">lock</i>
                        <input type={showPassword ? 'text' : 'password'} placeholder="Enter New Password" id="resetpassword" className="reset-password-field" required/>
                        <i className="material-symbols-outlined iconreset tagglpassword" onClick={togglePasswordVisibility}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </i>
                    </div>


                    <div className="reset-input-wrapper">
                        <i className="material-symbols-outlined iconresset">lock</i>
                        <input type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" id="resetconfirmpassword" className="reset-confirmpass-field" required/>
                        <i className="material-symbols-outlined iconreset togglpassword" onClick={togglePasswordVisibility}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </i>
                    </div>

                    <button className="resetbutton" onClick={()=>navigate("/successfulchange")}>Reset Password</button>
                </form>


                <p className="verreset" >Version 1.0</p>


            </div>
        </div>
    );
};

export default ResetPass;