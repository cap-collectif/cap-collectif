import React from 'react';
import classNames from 'classnames';
import IdeaPreviewHeader from './IdeaPreviewHeader';
import IdeaPreviewBody from './IdeaPreviewBody';
import { CardContainer } from '../../Ui/Card/CardContainer';

const IdeaPreview = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
  },

  render() {
    const { idea } = this.props;
    const classes = classNames({
      'bg-vip': idea.author.vip,
    });
    return (
      <CardContainer className={classes}>
        <IdeaPreviewHeader idea={idea} />
        <IdeaPreviewBody idea={idea} />
      </CardContainer>
    );
  },
});

export default IdeaPreview;
