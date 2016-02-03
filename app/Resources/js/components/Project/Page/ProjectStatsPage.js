import React from 'react';
import {IntlMixin} from 'react-intl';
import ProjectStatsList from './ProjectStatsList';
import {ButtonToolbar, ButtonGroup, Button} from 'react-bootstrap';

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
      showPercentage: {},
    };
  },

  showPercentage(stepId, value) {
    const showPercentage = this.state.showPercentage;
    showPercentage[stepId] = value;
    this.setState({
      showPercentage: showPercentage,
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
    return (
      <div>
        <h2>{this.getIntlMessage('project.stats.title')}</h2>
        <div className="block">
          {
            this.props.steps.length > 0
              ? this.props.steps.map((step, index) => {
                return (
                  <div key={index} className="block">
                    <h3>
                      {step.title}
                      <ButtonToolbar className="pull-right">
                        <ButtonGroup id={'step-stats-display-' + step.id}>
                          <Button
                            id={'step-stats-display-' + step.id + '-number'}
                            active={!this.state.showPercentage[step.id]}
                            onClick={this.showPercentage.bind(this, step.id, false)}
                          >
                            {this.getIntlMessage('project.stats.display.number')}
                          </Button>
                          <Button
                            id={'step-stats-display-' + step.id + '-percentage'}
                            active={this.state.showPercentage[step.id]}
                            onClick={this.showPercentage.bind(this, step.id, true)}
                          >
                            {this.getIntlMessage('project.stats.display.percentage')}
                          </Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </h3>
                    {
                      Object.keys(step.stats).map((key) => {
                        return (
                          <ProjectStatsList
                            key={key}
                            type={key}
                            stepId={step.id}
                            data={step.stats[key]}
                            label={'project.stats.list.' + key}
                            icon={icons[key]}
                            showPercentage={!!this.state.showPercentage[step.id]}
                            isCurrency={key === 'costs'}
                            showFilters={key === 'votes'}
                            themes={this.props.themes}
                            districts={this.props.districts}
                          />
                        );
                      })
                    }
                  </div>
                );
              })
              : <p>{this.getIntlMessage('project.stats.no_steps')}</p>
          }
        </div>
      </div>
    );
  },

});

export default ProjectStatsPage;
