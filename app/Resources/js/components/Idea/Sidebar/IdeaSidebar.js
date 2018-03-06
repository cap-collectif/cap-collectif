import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Col, Button } from 'react-bootstrap';
import classNames from 'classnames';
import IdeaVoteBox from '../Vote/IdeaVoteBox';

const IdeaSidebar = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    onToggleExpand: React.PropTypes.func.isRequired
  },

  render() {
    const { idea, expanded, onToggleExpand } = this.props;
    if (!idea.canContribute) {
      return null;
    }
    const wrapperClassName = classNames({
      'sidebar-hideable': true,
      'sidebar-hidden-small': !expanded
    });

    return (
      <Col xs={12} sm={3} className="sidebar" id="sidebar">
        <div className={wrapperClassName}>
          <IdeaVoteBox
            idea={idea}
            className="block block--bordered box"
            formWrapperClassName="sidebar__form"
          />
        </div>
        <Button
          block
          className="sidebar-toggle sidebar-hideable sidebar-hidden-large btn--no-radius"
          bsStyle={idea.userHasVote || expanded ? 'danger' : 'success'}
          bsSize="large"
          onClick={onToggleExpand}>
          <FormattedMessage
            id={
              expanded ? 'idea.vote.hide' : idea.userHasVote ? 'idea.vote.delete' : 'idea.vote.add'
            }
          />
        </Button>
      </Col>
    );
  }
});

export default IdeaSidebar;
