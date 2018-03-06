import React from 'react';
import { FormattedMessage } from 'react-intl';

const IdeaPreviewBody = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },

  render() {
    const { idea } = this.props;
    return (
      <div className="idea__preview__body">
        <h2 className="h4 idea__title smart-fade">
          <a href={idea._links.show}>{idea.title}</a>
        </h2>
        {idea.trashed ? (
          <span className="idea__label label label-default">
            {<FormattedMessage id="idea.preview.trashed" />}
          </span>
        ) : null}
      </div>
    );
  },
});

export default IdeaPreviewBody;
