import React, { useState } from 'react';
import style from './style.scss';

const BtnAtras = props =>{
    return (
        <button className="btn btnAtras" onClick={props.onClick}>
            <i className="material-icons">fast_rewind</i>
        </button>
    );
}

export default BtnAtras;