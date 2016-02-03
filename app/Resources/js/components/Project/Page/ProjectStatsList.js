import React from 'react';
import {IntlMixin} from 'react-intl';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import ProjectStatsListItem from './ProjectStatsListItem';
import ProjectStatsModal from './ProjectStatsModal';
import ProjectStatsFilters from './ProjectStatsFilters';
import ProjectStatsActions from '../../../actions/ProjectStatsActions';
import {DEFAULT_STATS_PAGINATION} from '../../../constants/ProjectStatsConstants';

const ProjectStatsList = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired,
    stepId: React.PropTypes.number.isRequired,
    icon: React.PropTypes.string.isRequired,
    label: React.PropTypes.string.isRequired,
    data: React.PropTypes.object.isRequired,
    showPercentage: React.PropTypes.bool.isRequired,
    isCurrency: React.PropTypes.bool.isRequired,
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    showFilters: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      data: this.props.data,
      theme: 0,
      district: 0,
    };
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
    ProjectStatsActions.load(
      this.props.stepId,
      this.props.type,
      DEFAULT_STATS_PAGINATION,
      this.state.theme,
      this.state.district
    )
      .then((response) => {
        this.setState({
          data: response.data,
        });
      })
    ;
  },

  render() {
    const {data} = this.state;

    return (
      <div className="block" id={'stats-' + this.props.stepId + '-' + this.props.type}>
        <ProjectStatsFilters
          themes={this.props.themes}
          districts={this.props.districts}
          onThemeChange={this.changeTheme}
          onDistrictChange={this.changeDistrict}
          showFilters={this.props.showFilters}
        />
        <ListGroup className="stats__list">
          <ListGroupItem className="stats__list__header">
            <i className={this.props.icon}></i> {this.getIntlMessage(this.props.label)}
          </ListGroupItem>
          {
            data.values.length > 0
            ? data.values.map((row, index) => {
              return (
                <ProjectStatsListItem
                  key={index}
                  item={row}
                  showPercentage={this.props.showPercentage}
                  isCurrency={this.props.isCurrency}
                />
              );
            })
            : <ListGroupItem className="excerpt text-center">
              {this.getIntlMessage('project.stats.no_values')}
            </ListGroupItem>
          }
        </ListGroup>
        {
          data.total > data.values.length
            ? <ProjectStatsModal
                type={this.props.type}
                stepId={this.props.stepId}
                data={data}
                label={this.props.label}
                icon={this.props.icon}
                showPercentage={this.props.showPercentage}
                isCurrency={this.props.isCurrency}
                theme={this.state.theme}
                district={this.state.district}
            />
            : null
        }
      </div>
    );
  },

});

export default ProjectStatsList;
