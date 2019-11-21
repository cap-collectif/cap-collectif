// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import ProjectStatsListItem from './ProjectStatsListItem';
import ProjectStatsModal from './ProjectStatsModal';
import ProjectStatsFilters from './ProjectStatsFilters';
import ProjectStatsActions from '../../../actions/ProjectStatsActions';
import { DEFAULT_STATS_PAGINATION } from '../../../constants/ProjectStatsConstants';

type Props = {
  type: string,
  stepId: string,
  icon: string,
  label: string,
  data: Object,
  step: Object,
  isCurrency: boolean,
  themes: Array<Object>,
  districts: Array<Object>,
  categories: Array<Object>,
  showFilters: boolean,
};
type State = {
  showPercentage: boolean,
  data: Object,
  theme: ?string,
  district: ?string,
  category: ?string,
};

export class ProjectStatsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showPercentage: false,
      data: props.data,
      theme: null,
      district: null,
      category: null,
    };
  }

  showPercentage = (value: boolean) => {
    this.setState({
      showPercentage: value,
    });
  };

  changeTheme = (ev: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState(
      {
        theme: ev.target.value,
      },
      () => {
        this.reloadData();
      },
    );
  };

  changeDistrict = (ev: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState(
      {
        district: ev.target.value,
      },
      () => {
        this.reloadData();
      },
    );
  };

  changeCategory = (ev: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState(
      {
        category: ev.target.value,
      },
      () => {
        this.reloadData();
      },
    );
  };

  reloadData = () => {
    const { stepId, type } = this.props;
    const { category, theme, district } = this.state;
    ProjectStatsActions.load(
      stepId,
      type,
      DEFAULT_STATS_PAGINATION,
      theme,
      district,
      category,
    ).then(response => {
      this.setState({
        data: response.data,
      });
    });
  };

  render() {
    const {
      districts,
      icon,
      isCurrency,
      label,
      showFilters,
      stepId,
      themes,
      categories,
      type,
      step,
    } = this.props;
    const { theme, district, showPercentage, data } = this.state;
    const haveData = data.values.reduce((a, b) => a + parseInt(b.value, 10), 0) !== 0;

    return (
      <div className="block" id={`stats-${stepId}-${type}`}>
        <ProjectStatsFilters
          themes={themes}
          districts={districts}
          categories={categories}
          onThemeChange={this.changeTheme}
          onDistrictChange={this.changeDistrict}
          onCategoryChange={this.changeCategory}
          showFilters={showFilters}
          showDistricts={step.usingDistricts || false}
          showThemes={step.usingThemes || false}
        />
        {haveData && (
          <ListGroup className="stats__list">
            <ListGroupItem className="stats__list__header">
              <i className={icon} /> <FormattedMessage id={label} />
              <span
                id={`step-stats-display-${stepId}`}
                className="pull-right excerpt stats__buttons">
                <Button
                  bsStyle="link"
                  id={`step-stats-display-${stepId}-number`}
                  active={!showPercentage}
                  onClick={this.showPercentage.bind(this, false)}>
                  <FormattedMessage id="project.stats.display.number" />
                </Button>
                <span>/</span>
                <Button
                  bsStyle="link"
                  id={`step-stats-display-${stepId}-percentage`}
                  active={showPercentage}
                  onClick={this.showPercentage.bind(this, true)}>
                  <FormattedMessage id="project.stats.display.percentage" />
                </Button>
              </span>
            </ListGroupItem>
            {data.values.length > 0 ? (
              data.values.map((row, index) => (
                <ProjectStatsListItem
                  key={index}
                  item={row}
                  showPercentage={showPercentage}
                  isCurrency={isCurrency}
                />
              ))
            ) : (
              <ListGroupItem className="excerpt text-center">
                <FormattedMessage id="project.stats.no_values" />
              </ListGroupItem>
            )}
          </ListGroup>
        )}
        {haveData && data.total > data.values.length && (
          <ProjectStatsModal
            type={type}
            stepId={stepId}
            data={data}
            label={label}
            icon={icon}
            showPercentage={showPercentage}
            isCurrency={isCurrency}
            theme={theme}
            district={district}
          />
        )}
      </div>
    );
  }
}

export default ProjectStatsList;
