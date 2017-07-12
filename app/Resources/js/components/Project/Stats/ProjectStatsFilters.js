import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import Input from '../../Form/Input';

export const ProjectStatsFilters = React.createClass({
  propTypes: {
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    categories: React.PropTypes.array.isRequired,
    showFilters: React.PropTypes.bool.isRequired,
    onThemeChange: React.PropTypes.func.isRequired,
    onDistrictChange: React.PropTypes.func.isRequired,
    onCategoryChange: React.PropTypes.func.isRequired,
    showThemes: React.PropTypes.bool.isRequired,
    showDistricts: React.PropTypes.bool.isRequired,
  },

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
    const showDistrictsFilter =
      showDistricts && districts && districts.length > 0;

    filtersNumber = showCategoriesFilter ? filtersNumber + 1 : filtersNumber;
    filtersNumber = showThemesFilter > 0 ? filtersNumber + 1 : filtersNumber;
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
        {showThemesFilter &&
          <Col xs={12} md={colWidth}>
            <Input
              id="stats-filter-themes"
              type="select"
              ref="themes"
              onChange={onThemeChange}>
              <option value="0">
                {<FormattedMessage id="global.select_themes" />}
              </option>
              {themes.map(theme =>
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>,
              )}
            </Input>
          </Col>}
        {showCategoriesFilter &&
          <Col xs={12} md={colWidth}>
            <Input
              id="stats-filter-categories"
              type="select"
              onChange={onCategoryChange}>
              <option value="0">
                {<FormattedMessage id="global.select_categories" />}
              </option>
              {categories.map(category =>
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>,
              )}
            </Input>
          </Col>}
        {showDistrictsFilter &&
          <Col xs={12} md={colWidth}>
            <Input
              id="stats-filter-districts"
              type="select"
              ref="districts"
              onChange={onDistrictChange}>
              <option value="0">
                {<FormattedMessage id="global.select_districts" />}
              </option>
              {districts.map(district =>
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>,
              )}
            </Input>
          </Col>}
      </Row>
    );
  },
});

export default connect((state, props) => {
  return {
    showThemes: state.default.features.themes && props.showThemes,
    showDistricts: state.default.features.districts && props.showDistricts,
  };
})(ProjectStatsFilters);
