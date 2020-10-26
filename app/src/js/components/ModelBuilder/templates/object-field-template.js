import React from "react";

function ObjectFieldTemplate(props) {
  const { TitleField, className, properties, title, description } = props;
  console.log(props)
  return (
    <div className={className}>
      <div className="model-builder-object">
        {properties.map(prop => (
          <div
            className="object-field"
            key={prop.content.key}>
            {prop.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ObjectFieldTemplate;
