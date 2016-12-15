import React from 'react';
import { IntlMixin } from 'react-intl';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';
import ProjectStatsListItem from './ProjectStatsListItem';
import ProjectStatsModal from './ProjectStatsModal';
import ProjectStatsFilters from './ProjectStatsFilters';
import ProjectStatsActions from '../../../actions/ProjectStatsActions';
import { DEFAULT_STATS_PAGINATION } from '../../../constants/ProjectStatsConstants';

const ProjectStatsList = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    stepId: React.PropTypes.number.isRequired,
    icon: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    isCurrency: React.PropTypes.bool.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    showFilters: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    const { data } = this.props;
    return {
      showPercentage: false,
      data,
      theme: 0,
      district: 0,
    };
  },

  showPercentage(value) {
    this.setState({
      showPercentage: value,
    });
  },

  changeTheme(ev) {
    this.setState({
      theme: ev.target.value,
    },
    () => {
      this.reloadData();
    });
  },

  changeDistrict(ev) {
    this.setState({
      district: ev.target.value,
    },
    () => {
      this.reloadData();
    });
  },


  reloadData() {
    const {
      stepId,
      type,
    } = this.props;
    ProjectStatsActions.load(
      stepId,
      type,
      DEFAULT_STATS_PAGINATION,
      this.state.theme,
      this.state.district,
    )
      .then((response) => {
        this.setState({
          data: response.data,
        });
      })
    ;
  },

  render() {
    const {
      districts,
      icon,
      isCurrency,
      label,
      showFilters,
      stepId,
      themes,
      type,
    } = this.props;
    const { data } = this.state;

    if (data.values.reduce((a, b) => a + parseInt(b.value, 10), 0) === 0) {
      return null;
    }

    return (
      <div className="block" id={`stats-${stepId}-${type}`}>
        <ProjectStatsFilters
          themes={themes}
          districts={districts}
          onThemeChange={this.changeTheme}
          onDistrictChange={this.changeDistrict}
          showFilters={showFilters}
        />
        <ListGroup className="stats__list">
          <ListGroupItem className="stats__list__header">
            <i className={icon}></i> {this.getIntlMessage(label)}
            <span id={`step-stats-display-${stepId}`} className="pull-right excerpt stats__buttons">
              <Button
                bsStyle="link"
                id={`step-stats-display-${stepId}-number`}
                active={!this.state.showPercentage}
                onClick={this.showPercentage.bind(this, false)}
              >
                {this.getIntlMessage('project.stats.display.number')}
              </Button>
              <span>/</span>
              <Button
                bsStyle="link"
                id={`step-stats-display-${stepId}-percentage`}
                active={this.state.showPercentage}
                onClick={this.showPercentage.bind(this, true)}
              >
                {this.getIntlMessage('project.stats.display.percentage')}
              </Button>
            </span>
          </ListGroupItem>
          {
            data.values.length > 0
            ? data.values.map((row, index) => {
              return (
                <ProjectStatsListItem
                  key={index}
                  item={row}
                  showPercentage={this.state.showPercentage}
                  isCurrency={isCurrency}
                />
              );
            })
            : <ListGroupItem className="excerpt text-center">
              {this.getIntlMessage('project.stats.no_values')}
            </ListGroupItem>
          }
        </ListGroup>
        {
          data.total > data.values.length &&
            <ProjectStatsModal
              type={type}
              stepId={stepId}
              data={data}
              label={label}
              icon={icon}
              showPercentage={this.state.showPercentage}
              isCurrency={isCurrency}
              theme={this.state.theme}
              district={this.state.district}
            />
        }
      </div>
    );
  },

});

export default ProjectStatsList;
