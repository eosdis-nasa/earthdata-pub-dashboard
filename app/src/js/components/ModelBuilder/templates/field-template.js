import React from "react";

function FieldTemplate(props) {
  const {id, classNames, label, help, required, description, errors, children} = props;
  console.log(props)
  return (
    <div className={`${classNames} model-builder-field`}>
      {label && (<label htmlFor={id}>{label}</label>)}
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
}

export default FieldTemplate
