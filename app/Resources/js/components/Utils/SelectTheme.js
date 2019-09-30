// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../Form/Select';
import type { SelectTheme_query } from '~relay/SelectTheme_query.graphql';

type Props = {|
  +query: SelectTheme_query,
  +intl: IntlShape,
  +multi: boolean,
  +clearable: boolean,
  +name: string,
  +className: string,
  +divId: string,
  +label: string,
  +optional: boolean,
|};

const renderLabel = (intl: IntlShape, label: string, optional: boolean) => {
  const message = intl.formatMessage({ id: label });
  return optional ? (
    <div>
      {message}
      <div className="excerpt inline">{intl.formatMessage({ id: 'global.optional' })}</div>
    </div>
  ) : (
    message
  );
};

export class SelectTheme extends React.Component<Props> {
  static defaultProps = {
    multi: false,
    clearable: false,
    name: 'theme',
    className: '',
    divId: 'testId',
    label: 'type-theme',
    optional: false,
  };

  render() {
    const { query, intl, multi, clearable, name, className, divId, label, optional } = this.props;
    const renderOptions =
      query && query.themes ? query.themes.map(p => ({ value: p.id, label: p.title })) : [];

    return (
      <div className={className} id={divId}>
        <Field
          component={select}
          id="SelectTheme-filter-theme"
          name={name}
          placeholder={intl.formatMessage({ id: 'event.searchform.all_themes' })}
          label={renderLabel(intl, label, optional)}
          options={renderOptions}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-controls="SelectTheme-filter-theme-listbox"
          multi={multi}
          clearable={clearable}
        />
      </div>
    );
  }
}

const container = injectIntl(SelectTheme);

export default createFragmentContainer(container, {
  query: graphql`
    fragment SelectTheme_query on Query {
      themes {
        id
        title
      }
    }
  `,
});
