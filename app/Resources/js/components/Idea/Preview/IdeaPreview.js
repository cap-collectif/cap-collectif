import React from 'react';
import classNames from 'classnames';
import IdeaPreviewHeader from './IdeaPreviewHeader';
import IdeaPreviewBody from './IdeaPreviewBody';
import IdeaPreviewFooter from './IdeaPreviewFooter';

const IdeaPreview = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired
  },

  render() {
    const { idea } = this.props;
    const classes = classNames({
      idea__preview: true,
      block: true,
      'block--bordered': true,
      box: true,
      'bg-vip': idea.author.vip
    });
    return (
      <div className={classes}>
        <IdeaPreviewHeader idea={idea} />
        <IdeaPreviewBody idea={idea} />
        <IdeaPreviewFooter idea={idea} />
      </div>
    );
  }
});

export default IdeaPreview;
