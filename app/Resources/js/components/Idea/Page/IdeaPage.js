import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import IdeaSidebar from '../Sidebar/IdeaSidebar';
import IdeaPageHeader from './IdeaPageHeader';
import IdeaPageBody from './IdeaPageBody';
import IdeaPageVotes from './IdeaPageVotes';
import IdeaPageComments from './IdeaPageComments';

export const IdeaPage = React.createClass({
  propTypes: {
    idea: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      expandSidebar: false,
    };
  },

  toggleSidebarExpand() {
    this.setState({
      expandSidebar: !this.state.expandSidebar,
    });
  },

  render() {
    const { idea } = this.props;
    const { expandSidebar } = this.state;
    const showSidebar = idea.canContribute;
    const wrapperClassName = classNames({
      container: showSidebar,
      sidebar__container: showSidebar,
    });
    const containersClassName = classNames({
      container: !showSidebar,
      'container--thinner': !showSidebar,
      'container--custom': true,
      'container--with-sidebar': showSidebar,
    });
    const overlayClassName = classNames({
      'sidebar__darkened-overlay': expandSidebar,
    });
    return (
      <div>
        <div id="sidebar-container" className={wrapperClassName}>
          <Row>
            <Col xs={12} sm={showSidebar ? 9 : 12}>
              <IdeaPageHeader idea={idea} className={containersClassName} />
              <IdeaPageBody idea={idea} className={containersClassName} />
              <IdeaPageVotes idea={idea} className={containersClassName} />
              <IdeaPageComments id={idea.id} className={containersClassName} />
            </Col>
            {showSidebar && <div id="sidebar-overlay" className={overlayClassName} />}
            {showSidebar && (
              <IdeaSidebar
                idea={idea}
                expanded={expandSidebar}
                onToggleExpand={this.toggleSidebarExpand}
              />
            )}
          </Row>
        </div>
      </div>
    );
  },
});

const mapStateToProps = state => {
  return {
    idea: state.idea.ideas[state.idea.currentIdeaById],
  };
};

export default connect(mapStateToProps)(IdeaPage);
