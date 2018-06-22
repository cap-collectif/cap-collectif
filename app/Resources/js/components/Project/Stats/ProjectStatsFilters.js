// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import Input from '../../Form/Input';
import type { State } from '../../../types';

type Props = {
  themes: Array<$FlowFixMe>,
  districts: Array<$FlowFixMe>,
  categories: Array<$FlowFixMe>,
  showFilters: boolean,
  onThemeChange: Function,
  onDistrictChange: Function,
  onCategoryChange: Function,
  showThemes: boolean,
  showDistricts: boolean,
};

export class ProjectStatsFilters extends React.Component<Props> {
  render() {
    const {
      districts,
      categories,
      onDistrictChange,
      onCategoryChange,
      onThemeChange,
      showFilters,
      themes,
      showThemes,
      showDistricts,
    } = this.props;
    if (!showFilters) {
      return null;
    }
    let filtersNumber = 0;
    const showCategoriesFilter = categories && categories.length > 0;
    const showThemesFilter = showThemes && themes && themes.length;
    const showDistrictsFilter = showDistricts && districts && districts.length > 0;

    filtersNumber = showCategoriesFilter ? filtersNumber + 1 : filtersNumber;
    filtersNumber = showThemesFilter ? filtersNumber + 1 : filtersNumber;
    filtersNumber = showDistrictsFilter ? filtersNumber + 1 : filtersNumber;

    let colWidth = 12;

    if (filtersNumber === 2) {
      colWidth = 6;
    }
    if (filtersNumber === 3) {
      colWidth = 4;
    }
    return (
      <Row className="stats__filters">
        {showThemesFilter && (
          <Col xs={12} md={colWidth}>
            <Input id="stats-filter-themes" type="select" ref="themes" onChange={onThemeChange}>
              <option value="">
                <FormattedMessage id="global.select_themes" />
              </option>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>
              ))}
            </Input>
          </Col>
        )}
        {showCategoriesFilter && (
          <Col xs={12} md={colWidth}>
            <Input id="stats-filter-categories" type="select" onChange={onCategoryChange}>
              <option value="">
                <FormattedMessage id="global.select_categories" />
              </option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Input>
          </Col>
        )}
        {showDistrictsFilter && (
          <Col xs={12} md={colWidth}>
            <Input
              id="stats-filter-districts"
              type="select"
              ref="districts"
              onChange={onDistrictChange}>
              <option value="">
                <FormattedMessage id="global.select_districts" />
              </option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </Input>
          </Col>
        )}
      </Row>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  showThemes: state.default.features.themes && props.showThemes,
  showDistricts: state.default.features.districts && props.showDistricts,
});

const container = connect(mapStateToProps)(ProjectStatsFilters);

export default container;
