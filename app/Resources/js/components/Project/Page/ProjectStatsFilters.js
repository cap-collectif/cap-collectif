import React from 'react';
import { IntlMixin } from 'react-intl';
import { Input, Row, Col } from 'react-bootstrap';

const ProjectStatsFilters = React.createClass({
  propTypes: {
    themes: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    showFilters: React.PropTypes.bool.isRequired,
    onThemeChange: React.PropTypes.func.isRequired,
    onDistrictChange: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (!this.props.showFilters) {
      return null;
    }

    return (
      <Row className="stats__filters">
        <Col xs={12} md={6}>
          <Input
            type="select"
            className="stats__filter--themes"
            ref="themes"
            onChange={this.props.onThemeChange}
          >
            <option value="0">
              {this.getIntlMessage('global.select_theme')}
            </option>
            {
              this.props.themes.map((theme) => {
                return (
                  <option key={theme.id} value={theme.id}>
                    {theme.title}
                  </option>
                );
              })
            }
          </Input>
        </Col>
        <Col xs={12} md={6}>
          <Input
            type="select"
            className="stats__filter--districts"
            ref="districts"
            onChange={this.props.onDistrictChange}
          >
            <option value="0">
              {this.getIntlMessage('global.select_district')}
            </option>
            {
              this.props.districts.map((district) => {
                return (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                );
              })
            }
          </Input>
        </Col>
      </Row>
    );
  },

});

export default ProjectStatsFilters;
