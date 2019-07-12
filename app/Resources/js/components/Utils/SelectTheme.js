// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../Form/Select';
import type { SelectTheme_query } from '~relay/SelectTheme_query.graphql';

type Props = {|
  query: SelectTheme_query,
  intl: IntlShape,
|};

export class SelectTheme extends React.Component<Props> {
  render() {
    const { query, intl } = this.props;

    return (
      <div>
        <Field
          component={select}
          id="SelectTheme-filter-theme"
          name="theme"
          placeholder={intl.formatMessage({ id: 'project.searchform.all_themes' })}
          label={intl.formatMessage({ id: 'type-theme' })}
          options={
            query && query.themes ? query.themes.map(p => ({ value: p.id, label: p.title })) : []
          }
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-controls="SelectTheme-filter-theme-listbox"
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
