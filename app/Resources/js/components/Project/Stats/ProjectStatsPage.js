import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';
import { Nav, NavItem } from 'react-bootstrap';
import ProjectStatsList from './ProjectStatsList';

export const ProjectStatsPage = React.createClass({
  propTypes: {
    projectId: PropTypes.string.isRequired,
    steps: PropTypes.array.isRequired,
    themes: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
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
    const {
      districts,
      steps,
      themes,
      categories,
    } = this.props;
    const icons = this.listIcons;
    const selectedStep = steps[this.state.selectedStepIndex];
    return (
      <div>
        <h2>{this.getIntlMessage('project.stats.title')}</h2>
        {
          steps.length > 1
            ? <Nav
              bsStyle="pills"
              justified
              activeKey={this.state.selectedStepIndex}
              onSelect={this.selectStep}
              className="block"
            >
              {
                steps.map((step, index) => {
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
                      label={`project.stats.list.${key}`}
                      icon={icons[key]}
                      isCurrency={key === 'costs'}
                      showFilters={key === 'votes'}
                      step={selectedStep}
                      themes={themes}
                      districts={districts}
                      categories={categories}
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

export default connect(
  (state, props) => {
    const collectSteps = props.steps.filter(step => step.type === 'collect');
    return {
      themes: state.default.themes,
      districts: state.default.districts,
      categories: collectSteps.length > 0 && collectSteps[0].stats && collectSteps[0].stats.categories
        ? collectSteps[0].stats.categories.values || []
        : [],
    };
  },
)(ProjectStatsPage);
