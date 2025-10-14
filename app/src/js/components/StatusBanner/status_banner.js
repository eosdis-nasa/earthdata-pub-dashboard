import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import _config from '../../config';

const StatusBanner = () => {

    const { additional_banner_class_names, banner_text } = _config;

    return ( banner_text ?
        <div className={`banner ${additional_banner_class_names}`}>
            <div className="textIconWrapper">
                <FontAwesomeIcon icon={faExclamationTriangle} style={{fontSize: "1.5em", marginRight: "0.5rem"}} />
                <h2 style={{marginBottom: "0"}}>{banner_text}</h2>
            </div>
        </div> : null
    );
};

export default StatusBanner;