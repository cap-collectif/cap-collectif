// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Nav, NavItem } from 'react-bootstrap';
import ProjectStatsList from './ProjectStatsList';
import type { GlobalState } from '../../../types';

type Props = {
  steps: Array<Object>,
  themes: Array<Object>,
  districts: Array<Object>,
  categories: Array<Object>,
};

type State = { selectedStepIndex: number };

const icons = {
  costs: 'cap cap-coins-2-1',
  districts: 'cap cap-marker-1-1',
  themes: 'cap cap-tag-1-1',
  userTypes: 'cap cap-contacts-1',
  votes: 'cap cap-hand-like-2-1',
};

export class ProjectStatsPage extends React.Component<Props, State> {
  state = {
    selectedStepIndex: 0,
  };

  selectStep = (index: number) => {
    this.setState({
      selectedStepIndex: index,
    });
  };

  render() {
    const { districts, steps, themes, categories } = this.props;
    const selectedStep = steps[this.state.selectedStepIndex];
    return (
      <div>
        <h2>
          <FormattedMessage id="project.stats.title" />
        </h2>
        {steps.length > 1 && (
          <Nav
            bsStyle="pills"
            justified
            activeKey={this.state.selectedStepIndex}
            onSelect={this.selectStep}
            className="block">
            {steps.map((step, index) => (
              <NavItem key={step.id} eventKey={index}>
                {step.title}
              </NavItem>
            ))}
          </Nav>
        )}
        {selectedStep ? (
          <div className="block stats__step-details">
            {Object.keys(selectedStep.stats).map(key => (
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
            ))}
          </div>
        ) : (
          <p className="project-stats__empty">{<FormattedMessage id="project.stats.no_data" />}</p>
        )}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props) => {
  const collectSteps = props.steps.filter(step => step.type === 'collect');
  return {
    themes: state.default.themes,
    categories:
      collectSteps.length > 0 && collectSteps[0].stats && collectSteps[0].stats.categories
        ? collectSteps[0].stats.categories.values || []
        : [],
  };
};

export default connect(mapStateToProps)(ProjectStatsPage);
