// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import IdeaActions from '../../../actions/IdeaActions';
import IdeaStore from '../../../stores/IdeaStore';
import IdeasListSearch from './IdeasListSearch';
import Input from '../../Form/Input';
import IdeaCreate from '../Create/IdeaCreate';
import type { State } from '../../../types';

export const IdeasListFilters = React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    themes: PropTypes.array.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      order: IdeaStore.order,
      theme: IdeaStore.theme,
      isLoading: true,
    };
  },

  componentWillMount() {
    IdeaStore.addChangeListener(this.onChange);
  },

  componentDidUpdate(prevProps, prevState) {
    const { onChange } = this.props;
    if (
      prevState &&
      (prevState.order !== this.state.order ||
        prevState.theme !== this.state.theme)
    ) {
      this.reload();
      onChange();
    }
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      order: IdeaStore.order,
      theme: IdeaStore.theme,
    });
  },

  orders: ['last', 'old', 'comments', 'popular'],

  handleOrderChange(ev) {
    const order = ev.target.value;
    IdeaActions.changeOrder(order);
  },

  handleThemeChange(ev) {
    let theme = ev.target.value;
    if (theme === '0') {
      theme = null;
    }
    IdeaActions.changeTheme(theme);
  },

  reload() {
    IdeaActions.load();
  },

  render() {
    const { features, onChange, themes } = this.props;
    return (
      <Row className="filter">
        {features.idea_creation &&
          <Col xs={12} sm={3} lg={2}>
            <IdeaCreate themes={themes} className="form-group" />
          </Col>}
        {features.themes &&
          <Col xs={12} sm={3}>
            <Input
              type="select"
              id="idea-filter-theme"
              onChange={this.handleThemeChange}
              value={this.state.theme || '0'}>
              <option value="0">
                {this.getIntlMessage('global.select_themes')}
              </option>
              {themes.map(theme => {
                return (
                  <option key={theme.id} value={theme.id}>
                    {theme.title}
                  </option>
                );
              })}
            </Input>
          </Col>}
        <Col xs={12} sm={3}>
          <Input
            id="idea-sorting"
            type="select"
            onChange={this.handleOrderChange}
            value={this.state.order}>
            {this.orders.map(choice => {
              return (
                <option key={choice} value={choice}>
                  {this.getIntlMessage(`global.filter_f_${choice}`)}
                </option>
              );
            })}
          </Input>
        </Col>
        <Col xs={12} sm={3} lg={4}>
          <IdeasListSearch onChange={onChange} />
        </Col>
      </Row>
    );
  },
});

const mapStateToProps = (state: State) => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(IdeasListFilters);
