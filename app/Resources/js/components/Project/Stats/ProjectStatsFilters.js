import React from 'react';
import { IntlMixin } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Input from '../../Form/Input';

const ProjectStatsFilters = React.createClass({
  propTypes: {
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    categories: React.PropTypes.array.isRequired,
    showFilters: React.PropTypes.bool.isRequired,
    onThemeChange: React.PropTypes.func.isRequired,
    onDistrictChange: React.PropTypes.func.isRequired,
    onCategoryChange: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      districts,
      categories,
      onDistrictChange,
      onCategoryChange,
      onThemeChange,
      showFilters,
      themes,
    } = this.props;
    if (!showFilters) {
      return null;
    }

    const colWidth = categories.length > 0 ? 4 : 6;

    return (
      <Row className="stats__filters">
        <Col xs={12} md={colWidth}>
          <Input
            id="stats-filter-themes"
            type="select"
            ref="themes"
            onChange={onThemeChange}
          >
            <option value="0">
              {this.getIntlMessage('global.select_themes')}
            </option>
            {
              themes.map(theme =>
                <option key={theme.id} value={theme.id}>
                  {theme.title}
                </option>,
              )
            }
          </Input>
        </Col>
        {
          categories.length > 0 &&
          <Col xs={12} md={colWidth}>
            <Input
              id="stats-filter-categories"
              type="select"
              onChange={onCategoryChange}
            >
              <option value="0">
                {this.getIntlMessage('global.select_categories')}
              </option>
              {
                categories.map(category =>
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>,
                )
              }
            </Input>
          </Col>
        }
        <Col xs={12} md={colWidth}>
          <Input
            id="stats-filter-districts"
            type="select"
            ref="districts"
            onChange={onDistrictChange}
          >
            <option value="0">
              {this.getIntlMessage('global.select_districts')}
            </option>
            {
              districts.map(district =>
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>,
              )
            }
          </Input>
        </Col>
      </Row>
    );
  },

});

export default ProjectStatsFilters;
