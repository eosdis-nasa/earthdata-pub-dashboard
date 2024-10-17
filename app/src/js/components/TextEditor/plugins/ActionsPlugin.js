import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';


async function handleImport() {
    console.log('Import clicked');
}

export default function ActionsPlugin({}) {
  return (
    <div className="actions">
      <button
        className="action-button import"
        onClick={() => handleImport()}
        title="Import"
        aria-label="Import editor state from JSON">
        <FontAwesomeIcon icon={faUpload} />
      </button>
    </div>
  );
}