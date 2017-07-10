import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import classNames from 'classnames';
import IdeaPageTrashBlock from './IdeaPageTrashBlock';
import IdeaPageButtons from './IdeaPageButtons';

const IdeaPageBody = React.createClass({
  propTypes: {
    idea: PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const { idea, className } = this.props;

    const classes = {
      idea__body: true,
    };
    classes[className] = true;

    return (
      <div className={classNames(classes)}>
        {idea.media &&
          <img
            id="idea-media"
            src={idea.media.url}
            alt=""
            className="block img-responsive"
          />}
        <div className="block" id="idea-body">
          <h2 className="h2">
            {this.getIntlMessage('idea.body')}
          </h2>
          <FormattedHTMLMessage message={idea.body} />
        </div>

        {idea.object
          ? <div className="block" id="idea-object">
              <h2 className="h2">
                {this.getIntlMessage('idea.object')}
              </h2>
              <FormattedHTMLMessage message={idea.object} />
            </div>
          : null}

        {idea.url
          ? <div className="block" id="idea-url">
              <h2 className="h2">
                {this.getIntlMessage('idea.url')}
              </h2>
              <p>
                <a className="external-link" href={idea.url}>
                  {idea.url}
                </a>
              </p>
            </div>
          : null}

        <IdeaPageTrashBlock idea={idea} />

        <IdeaPageButtons idea={idea} />
      </div>
    );
  },
});

export default IdeaPageBody;
