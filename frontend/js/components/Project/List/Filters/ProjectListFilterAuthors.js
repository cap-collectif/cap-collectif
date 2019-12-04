// @flow
import React from 'react';
import { Field } from 'redux-form';
import { type IntlShape } from 'react-intl';
import select from '../../../Form/Select';
import type { ProjectAuthor } from './ProjectListFiltersContainer';

type Props = {
  intl: IntlShape,
  authors: ProjectAuthor[],
  author: ?string,
};

export default class ProjectsListFilterAuthors extends React.Component<Props> {
  render() {
    const { intl, author, authors } = this.props;
    if (authors.length > 0) {
      return (
        <Field
          id="project-type"
          componentClass="select"
          component={select}
          clearable
          type="select"
          name="author"
          value={author}
          placeholder={intl.formatMessage({ id: 'global.author' })}
          options={authors.map(a => ({
            value: a.id,
            label: a.username,
            ariaLabel: a.username,
          }))}
        />
      );
    }
    return null;
  }
}
