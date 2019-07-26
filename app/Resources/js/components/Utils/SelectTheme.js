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
  +multi?: boolean,
  +clearable?: boolean,
  +name?: string,
  +className?: string,
  +divId?: string,
|};

export class SelectTheme extends React.Component<Props> {
  static defaultProps = {
    multi: false,
    clearable: false,
    name: 'theme',
    className: '',
    divId: '',
  };

  render() {
    const { query, intl, multi, clearable, name, className, divId } = this.props;
    const renderOptions =
      query && query.themes ? query.themes.map(p => ({ value: p.id, label: p.title })) : [];

    return (
      <div className={className} id={divId}>
        <Field
          component={select}
          id="SelectTheme-filter-theme"
          name={name}
          placeholder={intl.formatMessage({ id: 'event.searchform.all_themes' })}
          label={intl.formatMessage({ id: 'type-theme' })}
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
