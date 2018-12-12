// @flow
import React from 'react';
import { injectIntl } from 'react-intl';
import { Col, Row, FormControl, Button } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { changeOrderBy, changeTerm, changeTheme } from '../../../redux/modules/project';
import Input from '../../Form/ReactBootstrapInput';
import type { GlobalState } from '../../../types';
import ProjectsListFilterTypes from './ProjectListFilterTypes';

type Props = {
  dispatch: Function,
  orderBy: string,
  intl: Object,
  type: ?string,
  themes: Array<{ id: string, slug: string, title: string }>,
  features: { themes: boolean },
  term: ?string,
  theme: ?string,
};

type State = {
  value?: string,
};

class ProjectListFilter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { value: props.term || '' };
  }

  handleChangeTermInput = event => {
    this.setState({ value: event.target.value });
  };

  handleSubmit = e => {
    const { dispatch } = this.props;
    const { value } = this.state;
    e.preventDefault();
    dispatch(changeTerm(value && value.length > 0 ? value : null));
  };

  renderTypeFilter() {
    const { dispatch, type, intl } = this.props;
    return <ProjectsListFilterTypes dispatch={dispatch} intl={intl} type={type} />;
  }

  renderThemeFilter() {
    const { features, themes, theme, dispatch, intl } = this.props;
    if (features.themes) {
      return (
        <FormControl
          id="project-theme"
          componentClass="select"
          type="select"
          name="theme"
          onChange={e => {
            dispatch(changeTheme(e.target.value));
          }}
          value={theme}>
          <option key="all" value="">
            {intl.formatMessage({ id: 'global.select_themes' })}
          </option>
          {themes.map(t => (
            <option key={t.slug} value={t.id}>
              {t.title}
            </option>
          ))}
        </FormControl>
      );
    }
  }

  renderOrderFilter() {
    const { dispatch, orderBy, intl } = this.props;

    return (
      <FormControl
        id="project-sorting"
        componentClass="select"
        type="select"
        name="orderBy"
        value={orderBy}
        onChange={e => {
          dispatch(changeOrderBy(e.target.value));
        }}>
        <option key="date" value="LATEST">
          {intl.formatMessage({ id: 'project.sort.last' })}
        </option>
        <option key="popularity" value="POPULAR">
          {intl.formatMessage({ id: 'global.filter_f_popular' })}
        </option>
      </FormControl>
    );
  }

  renderSearchFilter() {
    const { value } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          id="project-search-input"
          type="text"
          placeholder="navbar.search"
          buttonAfter={
            <Button id="project-search-button" type="submit">
              <i className="cap cap-magnifier" />
            </Button>
          }
          groupClassName="project-search-group pull-right w-100"
          value={value}
          onChange={this.handleChangeTermInput}
        />
      </form>
    );
  }

  render() {
    const filters = [];
    filters.push(this.renderOrderFilter());
    filters.push(this.renderTypeFilter());
    filters.push(this.renderThemeFilter());
    filters.push(this.renderSearchFilter());

    const columnWidth = 12 / filters.length;
    return (
      <Row className="mb-35">
        {filters.map((filter, index) => (
          <Col key={index} xs={12} sm={columnWidth}>
            {filter}
          </Col>
        ))}
      </Row>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  features: state.default.features,
  themes: state.default.themes,
  orderBy: state.project.orderBy || 'LATEST',
  type: state.project.type,
  theme: state.project.theme,
  term: state.project.term,
});

export default connect(mapStateToProps)(injectIntl(ProjectListFilter));
