import React from 'react';
import 'style/button.css';

export enum ButtonStatus {
    NORMAL,
    LOADING,
    SUCCESS
}

export const Button = (props: any) => {
    const {status, onClick, children} = props;
    switch (status) {
        case ButtonStatus.LOADING:
            return <button className="resumeButton">
                <div className="loader"/>
            </button>
        case ButtonStatus.SUCCESS:
            return <button className="resumeButton success" disabled>SUCCESS</button>
    }
    return <button className="resumeButton" onClick={onClick}>{children}</button>
}