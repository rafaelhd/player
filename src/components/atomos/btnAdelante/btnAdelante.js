import React, { useState } from 'react';
import style from './style.scss';

const BtnAdelante = props =>  {
    return (
        <button className="btn btnAdelante" onClick={props.onClick}>
            <i className="material-icons">fast_forward</i>
        </button>
    );
    
}
export default BtnAdelante;