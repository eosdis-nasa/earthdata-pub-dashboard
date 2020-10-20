import React from "react";

function ArrayFieldTitle({ TitleField, idSchema, title, required }) {
  if (!title) {
    return null;
  }
  const id = `${idSchema.$id}__title`;
  return <TitleField id={id} title={title} required={required}/>;
}

function ArrayFieldDescription({ DescriptionField, idSchema, description }) {
  if (!description) {
    return null;
  }
  const id = `${idSchema.$id}__description`;
  return <DescriptionField id={id} description={description} />;
}

function ArrayFieldTemplate(props) {
  return (
    <div className={`${props.className} model-builder-field`}>
    <ArrayFieldTitle
        key={`array-field-title-${props.idSchema.$id}`}
        TitleField={props.TitleField}
        idSchema={props.idSchema}
        title={props.uiSchema["ui:title"] || props.title}
        required={props.required}
      />
    <ArrayFieldDescription
        key={`array-field-description-${props.idSchema.$id}`}
        DescriptionField={props.DescriptionField}
        idSchema={props.idSchema}
        description={props.uiSchema["ui:description"] || props.schema.description}
      />
      <div className={`${props.className} model-builder-array`}>
      {props.items &&
        props.items.map(element => (
          <div key={element.key} className={`${element.className} array-item`}>
            <div>{element.children}</div>
            <div className="row">
              {element.hasMoveDown && (
                <button
                  className='button button--small'
                  onClick={element.onReorderClick(element.index, element.index + 1)}>Down</button>
              )}
              {element.hasMoveUp && (
                <button
                  className='button button--small'
                  onClick={element.onReorderClick(element.index, element.index - 1)}>Up</button>
              )}
              <button
                className='button button--small'
                onClick={element.onDropIndexClick(element.index)}>Remove</button>
            </div>
          </div>
        ))}
        </div>

      {props.canAdd && (
        <button
          className="button button--small"
          onClick={props.onAddClick} type="button">Add Row</button>
      )}
    </div>
  );
}

export default ArrayFieldTemplate;
