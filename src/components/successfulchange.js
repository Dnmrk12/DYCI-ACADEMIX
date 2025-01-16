import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import './successfulchange.css';


const Successfulchange = () => {
    const navigate = useNavigate();

    return (
        <div className="Successfulchangewrap">
            <div className="SuccessfulMessage">
            <svg xmlns="http://www.w3.org/2000/svg" className="svgsuccess" viewBox="0 0 1440 320"><path fill="#F7FBFC" fill-opacity="1" d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,69.3C672,21,768,11,864,58.7C960,107,1056,213,1152,250.7C1248,288,1344,256,1392,240L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                <h1 className="title-success">Successful Password Reset!</h1>


                <p className="successMessage">Congratulations! Your password has been successfully reset. You can now log in with your new password. 
                    Thank you for taking steps to keep your account secure. If you have any questions or need further assistance, feel free to contact our support team.
                 </p>

                 <button className="loginbackbutton" onClick={()=>navigate("/loginform")}>Login</button>

                
            </div>
        </div>
    );
};

export default Successfulchange;