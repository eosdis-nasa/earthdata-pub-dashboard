import React from "react";

const List = ({ list }) => {
  return (
    <ul className="list">
      {list.map((item, index) => (
        <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
      ))}
    </ul>
  );
};

export default List;
