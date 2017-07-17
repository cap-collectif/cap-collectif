import React from 'react';
import { IntlMixin, FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';

const IdeaPageTrashBlock = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { idea } = this.props;

    if (!idea.trashed) {
      return null;
    }

    return (
      <div id="idea__trash-block">
        <h2>
          {this.getIntlMessage('idea.trashed.reason')}
        </h2>
        {
          idea.trashedReason
          ? <p>{idea.trashedReason}</p>
          : <p>{this.getIntlMessage('idea.trashed.no_reason')}</p>
        }
        <p className="excerpt">
          <FormattedMessage
            date={
              <FormattedDate
                value={moment(idea.trashedAt)}
                day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"
              />
            }
            message={this.getIntlMessage('idea.trashed.date')}
          />
        </p>
      </div>
    );
  },

});

export default IdeaPageTrashBlock;
