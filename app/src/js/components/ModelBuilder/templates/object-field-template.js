import React from "react";

function ObjectFieldTemplate(props) {
  const { TitleField, className, properties, title, description } = props;
  console.log(props)
  return (
    <div className={className}>
      {title && (<TitleField title={title} />)}
      <div className="model-builder-object">
        {properties.map(prop => (
          <div
            className="object-field"
            key={prop.content.key}>
            {prop.content}
          </div>
        ))}
      </div>
      {description}
    </div>
  );
}

export default ObjectFieldTemplate;
