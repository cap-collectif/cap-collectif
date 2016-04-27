import React from 'react';
import { IntlMixin } from 'react-intl';
import ProjectStatsList from './ProjectStatsList';
import { Nav, NavItem } from 'react-bootstrap';

const ProjectStatsPage = React.createClass({
  propTypes: {
    projectId: React.PropTypes.number.isRequired,
    steps: React.PropTypes.array.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      selectedStepIndex: 0,
    };
  },

  selectStep(index) {
    this.setState({
      selectedStepIndex: index,
    });
  },

  listIcons: {
    costs: 'cap cap-coins-2-1',
    districts: 'cap cap-marker-1-1',
    themes: 'cap cap-tag-1-1',
    userTypes: 'cap cap-contacts-1',
    votes: 'cap cap-hand-like-2-1',
  },

  render() {
    const icons = this.listIcons;
    const selectedStep = this.props.steps[this.state.selectedStepIndex];
    return (
      <div>
        <h2>{this.getIntlMessage('project.stats.title')}</h2>
        {
          this.props.steps.length > 1
          ? <Nav
              bsStyle="pills"
              justified
              activeKey={this.state.selectedStepIndex}
              onSelect={this.selectStep}
              className="block"
          >
              {
                this.props.steps.map((step, index) => {
                  return (
                    <NavItem key={step.id} eventKey={index}>
                      {step.title}
                    </NavItem>
                  );
                })
              }
            </Nav>
          : null
        }
        {
          selectedStep
          ? <div className="block stats__step-details">
              {
                Object.keys(selectedStep.stats).map((key) => {
                  return (
                    <ProjectStatsList
                      key={key}
                      type={key}
                      stepId={selectedStep.id}
                      data={selectedStep.stats[key]}
                      label={'project.stats.list.' + key}
                      icon={icons[key]}
                      isCurrency={key === 'costs'}
                      showFilters={key === 'votes'}
                      themes={this.props.themes}
                      districts={this.props.districts}
                    />
                  );
                })
              }
          </div>
          : <p className="project-stats__empty">
            {this.getIntlMessage('project.stats.no_data')}
          </p>
        }
      </div>
    );
  },

});

export default ProjectStatsPage;
