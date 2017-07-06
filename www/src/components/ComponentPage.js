
import React from 'react';
import transform from 'lodash/transform';


function displayObj(obj){
  return JSON.stringify(obj, null, 2).replace(/"|'/g, '')
}

let capitalize = str => str[0].toUpperCase() + str.substr(1);
let cleanDocletValue = str => str.trim().replace(/^\{/, '').replace(/\}$/, '');

const extractMarkdown = ({ description }) => (
  description &&
  description.childMarkdownRemark &&
  description.childMarkdownRemark.html
);

class ComponentPage extends React.Component {
  render() {
    const { metadata, ...props } = this.props;

    return (
      <div {...this.props}>
        <h2 id={metadata.displayName}><a href={`#${metadata.displayName}`}>
          {metadata.displayName}</a>
        </h2>
        <p dangerouslySetInnerHTML={{ __html: extractMarkdown(metadata) }} />

        <h3>Props</h3>
        {metadata.props.map(p =>
          this.renderProp(p, metadata.displayName
        ))}
      </div>
    )
  }

  renderProp = (prop, componentName) => {
    const { defaultValue, name, required } = prop
    let typeInfo = this.renderType(prop);
    let id = `${componentName}-prop-${name}`;

    return (
      <section key={name}>
        <h4 id={id}>
          <a href={`#${id}`}><code>{name}</code></a>
          {required && (
            <strong>{' required'}</strong>
          )}
        </h4>
        <div dangerouslySetInnerHTML={{ __html: extractMarkdown(prop) }} />

        <div style={{ paddingLeft: 0 }}>
          <div>
            {'type: '}
            { typeInfo && typeInfo.type === 'pre' ? typeInfo : <code>{typeInfo}</code> }
          </div>
          {defaultValue &&
            <div>default: <code>{defaultValue.value.trim()}</code></div>
          }
        </div>
      </section>
    )
  }

  renderType(prop) {
    let type = prop.type || {};
    let name = getDisplayTypeName(type.name);
    let doclets = prop.doclets || {};

    switch (name) {
      case 'node':
        return 'any';
      case 'function':
        return 'Function';
      case 'elementType':
        return 'ReactClass<any>';
      case 'dateFormat':
        return 'string | (date: Date, culture: ?string, localizer: Localizer) => string';
      case 'dateRangeFormat':
        return '(range: { start: Date, end: Date }, culture: ?string, localizer: Localizer) => string';
      case 'object':
      case 'Object':
        if (type.value)
          return (
            <pre className='shape-prop'>
              {displayObj(renderObject(type.value))}
            </pre>
          )

        return name;
      case 'union':
        return type.value.reduce((current, val, i, list) => {
          val = typeof val === 'string' ? { name: val } : val;
          let item = this.renderType({ type: val });

          if (React.isValidElement(item)) {
            item = React.cloneElement(item, {key: i});
          }

          current = current.concat(item);

          return i === (list.length - 1) ? current : current.concat(' | ');
        }, []);
      case 'array':
      case 'Array': {
        let child = this.renderType({ type: type.value });

        return <span>{'Array<'}{ child }{'>'}</span>;
      }
      case 'enum':
        return this.renderEnum(type);
      case 'custom':
        return cleanDocletValue(doclets.type || name);
      default:
        return name;
    }
  }

  renderEnum(enumType) {
    const enumValues = enumType.value || [];
    return <code>{enumValues.join(' | ')}</code>;
  }
}

function getDisplayTypeName(typeName) {
  if (typeName === 'func') {
    return 'function';
  } else if (typeName === 'bool') {
    return 'boolean';
  } else if (typeName === 'object') {
    return 'Object';
  }

  return typeName;
}

function renderObject(props){
  return transform(props, (obj, val, key) => {
    obj[val.required ? key : key + '?'] = simpleType(val)

  }, {})
}

function simpleType(prop) {
  let type = prop.type || {};
  let name = getDisplayTypeName(type.name);
  let doclets = prop.doclets || {};

  switch (name) {
    case 'node':
      return 'any';
    case 'function':
      return 'Function';
    case 'elementType':
      return 'ReactClass<any>';
    case 'object':
    case 'Object':
      if (type.value)
        return renderObject(type.value)
      return name;
    case 'array':
    case 'Array': {
      let child = simpleType({ type: type.value });

      return 'Array<' + child + '>';
    }
    case 'custom':
      return cleanDocletValue(doclets.type || name);
    default:
      return name;
  }
}
export default ComponentPage;

export const descFragment = graphql`
  fragment ComponentPage_desc on ComponentDescription {
    childMarkdownRemark {
      html
    }
  }
`;

export const propsFragment = graphql`
  fragment ComponentPage_prop on ComponentProp {
    name
    required
    type {
      name
      value
      raw
    }
    defaultValue {
      value
      computed
    }
    description {
      ...ComponentPage_desc
    }
    doclets { type }
  }
`;

export const query = graphql`
  fragment ComponentPage_metadata on ComponentMetadata {
    displayName
    composes
    description {
      ...ComponentPage_desc
    }
    props {
      ...ComponentPage_prop
    }
  }
`;
