import React, { PropTypes } from 'react';
import Select from 'react-select';

export const renderSelect = React.createClass({
  propTypes: {
    input: PropTypes.any,
    touched: PropTypes.bool.isRequired,
    error: PropTypes.any,
  },

  render() {
    const { input, touched, error } = this.props;
    return (
      <div className="form-group">
        <label htmlFor={input.name} className="col-sm-2 control-label">{ input.label }</label>
        <div className="col-sm-10">
          {
            typeof input.loadOptions === 'function' ?
              <Select.Async
                {...input}
                noResultsText={'En attente de résultats...'}
                onBlur={() => { input.onBlur(input.value); }}
                onChange={event => { input.onChange(Array.isArray(event) ? event.map(e => e.value) : event); }}
              />
            : <Select {...input} onBlur={() => input.onBlur(input.value)} />
          }
          { touched && error }
        </div>
      </div>
    );
  },
});
