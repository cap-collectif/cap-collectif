import React from 'react';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import { IntlMixin } from 'react-intl';
import IdeaStore from '../../../stores/IdeaStore';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaSidebar from '../Sidebar/IdeaSidebar';
import IdeaPageHeader from './IdeaPageHeader';
import IdeaPageBody from './IdeaPageBody';
import IdeaPageVotes from './IdeaPageVotes';
import IdeaPageComments from './IdeaPageComments';

const IdeaPage = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    votes: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      idea: IdeaStore.idea,
      expandSidebar: false,

    };
  },

  componentWillMount() {
    const {
      idea,
      votes,
    } = this.props;
    IdeaStore.addChangeListener(this.onChange);
    IdeaActions.initIdea(idea, votes);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      idea: IdeaStore.idea,
    });
  },

  toggleSidebarExpand() {
    this.setState({
      expandSidebar: !this.state.expandSidebar,
    });
  },

  render() {
    const {
      themes,
      votes,
    } = this.props;
    const { idea } = this.state;
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
      'sidebar__darkened-overlay': this.state.expandSidebar,
    });
    return (
      <div>
        <div id="sidebar-container" className={wrapperClassName}>
          <Row>
            <Col xs={12} sm={showSidebar ? 9 : 12}>
              <IdeaPageHeader
                idea={idea}
                className={containersClassName}
              />
              <IdeaPageBody
                idea={idea}
                themes={themes}
                className={containersClassName}
              />
              <IdeaPageVotes
                idea={idea}
                votes={votes}
                className={containersClassName}
              />
              <IdeaPageComments
                id={idea.id}
                className={containersClassName}
              />
            </Col>
            {
              showSidebar &&
                 <div id="sidebar-overlay" className={overlayClassName} />
            }
            {
              showSidebar &&
                <IdeaSidebar
                    idea={idea}
                    expanded={this.state.expandSidebar}
                    onToggleExpand={this.toggleSidebarExpand}
                />
            }
          </Row>
        </div>
      </div>
    );
  },

});

export default IdeaPage;
