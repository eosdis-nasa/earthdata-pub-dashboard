import React from 'react';

const KeywordHandler = ({ keyword }) => {
  return (
    <div>
      <h2>{keyword ? `Keyword Detected: ${keyword}` : 'No Path Detected'}</h2>
      <p>{keyword ? `You have accessed the section related to "${keyword}".` : 'No specific path detected in the URL.'}</p>
    </div>
  );
};

export default KeywordHandler;
