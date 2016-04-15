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
    IdeaActions.initIdea(this.props.idea);
    return {
      idea: IdeaStore.idea,
      expandSidebar: false,
    };
  },

  componentWillMount() {
    IdeaStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (!IdeaStore.isProcessing) {
      this.setState({
        idea: IdeaStore.idea,
      });
      return;
    }

    this.loadIdea();
  },

  loadIdea() {
    IdeaActions.getOne(
      this.state.idea.id
    );
  },

  toggleSidebarExpand() {
    this.setState({
      expandSidebar: !this.state.expandSidebar,
    });
  },

  render() {
    const { idea } = this.state;
    const showSidebar = idea.canContribute;
    const wrapperClassName = classNames({
      'container': showSidebar,
      'sidebar__container': showSidebar,
    });
    const containersClassName = classNames({
      'container': !showSidebar,
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
                themes={this.props.themes}
                className={containersClassName}
              />
              <IdeaPageVotes
                idea={idea}
                votes={this.props.votes}
                className={containersClassName}
              />
              <IdeaPageComments
                id={idea.id}
                className={containersClassName}
              />
            </Col>
            {
              showSidebar
              ? <div id="sidebar-overlay" className={overlayClassName} />
              : null
            }
            {
              showSidebar
              ? <IdeaSidebar
                  idea={idea}
                  expanded={this.state.expandSidebar}
                  onToggleExpand={this.toggleSidebarExpand}
              />
              : null
            }
          </Row>
        </div>
      </div>
    );
  },

});

export default IdeaPage;
