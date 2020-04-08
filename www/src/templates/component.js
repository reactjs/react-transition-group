import { graphql } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Container } from 'react-bootstrap';
import transform from 'lodash/transform';

import Layout from '../components/Layout';
import Example from '../components/Example';

function displayObj(obj) {
  return JSON.stringify(obj, null, 2).replace(/"|'/g, '');
}

let cleanDocletValue = str =>
  str
    .trim()
    .replace(/^\{/, '')
    .replace(/\}$/, '');

const extractMarkdown = ({ description }) =>
  description &&
  description.childMarkdownRemark &&
  description.childMarkdownRemark.html;

const propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        componentPages: PropTypes.arrayOf(
          PropTypes.shape({
            displayName: PropTypes.string.isRequired,
            codeSandboxId: PropTypes.string,
          })
        ).isRequired,
      }).isRequired,
    }).isRequired,
    metadata: PropTypes.shape({
      displayName: PropTypes.string,
      composes: PropTypes.arrayOf(PropTypes.string),
      description: PropTypes.object.isRequired,
    }),
  }).isRequired,
};

class ComponentTemplate extends React.Component {
  render() {
    const { data, location } = this.props;
    const { metadata } = data;
    const { componentPages } = data.site.siteMetadata;
    const { codeSandboxId } = componentPages.find(
      page => page.displayName === metadata.displayName
    );
    return (
      <Layout data={data} location={location}>
        <div>
          <Container>
            <h1 id={metadata.displayName}>{metadata.displayName}</h1>
            <div
              dangerouslySetInnerHTML={{ __html: extractMarkdown(metadata) }}
            />

            {codeSandboxId != null && (
              <Example
                codeSandbox={{
                  title: `${metadata.displayName} Component`,
                  id: codeSandboxId,
                }}
              />
            )}

            <h2 id={`${metadata.displayName}-props`}>
              <a href={`#${metadata.displayName}-props`}>Props</a>
              {metadata.composes && (
                <>
                  {' '}
                  <small style={{ fontStyle: 'italic', fontSize: '70%' }}>
                    Accepts all props from{' '}
                    {metadata.composes
                      .map(p => (
                        <code key={p}>{`<${p.replace('./', '')}>`}</code>
                      ))
                      .reduce((acc, el, i) => {
                        acc.push(el);
                        if (i < metadata.composes.length - 1) {
                          acc.push(', ');
                        }
                        return acc;
                      }, [])}{' '}
                    unless otherwise noted.
                  </small>
                </>
              )}
            </h2>
            {metadata.props.map(p => this.renderProp(p, metadata.displayName))}
          </Container>
        </div>
      </Layout>
    );
  }

  renderProp = (prop, componentName) => {
    const { defaultValue, name, required } = prop;
    let typeInfo = this.renderType(prop);
    let id = `${componentName}-prop-${name}`;

    return (
      <section key={name}>
        <h3 id={id} style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          <a href={`#${id}`}>
            <code>{name}</code>
          </a>
        </h3>
        <div dangerouslySetInnerHTML={{ __html: extractMarkdown(prop) }} />

        <div style={{ paddingLeft: 0 }}>
          <div>
            {'type: '}
            {typeInfo && typeInfo.type === 'pre' ? (
              typeInfo
            ) : (
              <code>{typeInfo}</code>
            )}
          </div>
          {required && <div>required</div>}
          {defaultValue && (
            <div>
              default: <code>{defaultValue.value.trim()}</code>
            </div>
          )}
        </div>
      </section>
    );
  };

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
            <pre className="shape-prop">
              {displayObj(renderObject(type.value))}
            </pre>
          );

        return name;
      case 'union':
        return type.value.reduce((current, val, i, list) => {
          val = typeof val === 'string' ? { name: val } : val;
          let item = this.renderType({ type: val });

          if (React.isValidElement(item)) {
            item = React.cloneElement(item, { key: i });
          }

          current = current.concat(item);

          return i === list.length - 1 ? current : current.concat(' | ');
        }, []);
      case 'array':
      case 'Array': {
        let child = this.renderType({ type: type.value });

        return (
          <span>
            {'Array<'}
            {child}
            {'>'}
          </span>
        );
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

ComponentTemplate.propTypes = propTypes;

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

function renderObject(props) {
  return transform(
    props,
    (obj, val, key) => {
      obj[val.required ? key : key + '?'] = simpleType(val);
    },
    {}
  );
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
      if (type.value) return renderObject(type.value);
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

export const query = graphql`
  query ComponentMetadata($displayName: String!) {
    site {
      ...Layout_site
    }
    metadata: componentMetadata(displayName: { eq: $displayName }) {
      displayName
      composes
      description: childComponentDescription {
        childMarkdownRemark {
          html
        }
      }
      props {
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
        description: childComponentDescription {
          childMarkdownRemark {
            html
          }
        }
        doclets
      }
    }
  }
`;

export default ComponentTemplate;
