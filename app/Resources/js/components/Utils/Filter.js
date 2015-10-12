
const Filter = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired,
    values: React.PropTypes.array,
    onChange: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      values: ['popular', 'last', 'old'],
    }
  },

  render() {
    return (
      <select ref="filter" className="form-control pull-right" value={this.props.value} onChange={this.props.onChange}>
        {
          this.props.values.map((value) => {
            <option value={value}>{this.getIntlMessage('global.filter_' + value)}</option>
          })
        }
      </select>
    );
  },

});

export default Filter;
