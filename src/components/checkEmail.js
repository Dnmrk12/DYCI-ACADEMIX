import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import './checkEmail.css';


const CheckEmail = () => {

    return (
        <div className="checkEmailwrapper">
            <div className="emailMessage">
            <svg xmlns="http://www.w3.org/2000/svg" className="svgcheckEmail" viewBox="0 0 1440 320"><path fill="#F7FBFC" fill-opacity="1" d="M0,0L48,48C96,96,192,192,288,197.3C384,203,480,117,576,69.3C672,21,768,11,864,58.7C960,107,1056,213,1152,250.7C1248,288,1344,256,1392,240L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                <h1 className="title">Check your Email</h1>


                <p className="requestEmail">A request to reset your password has been received. To proceed with the reset, please check your DYCI email for a message from us. 
                    This email will contain a link that you can use to reset your password. Make sure to check your spam or junk folder if you do not see the email in your inbox.
                 </p>

                <p className="AT">  Thank you for using our service. </p>
                <p className="ATname">-Academix Team</p>

                <Link to="/resetpass" className="forgotpasswordtext" >reset</Link>
            </div>
        </div>
    );
};

export default CheckEmail;