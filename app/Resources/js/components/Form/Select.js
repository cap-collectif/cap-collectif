import React, { PropTypes } from 'react';
import Select from 'react-select';

export const renderSelect = React.createClass({
  propTypes: {
    input: PropTypes.any,
    meta: PropTypes.any,
    touched: PropTypes.bool,
    label: PropTypes.any.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.any,
    options: PropTypes.array,
    clearable: PropTypes.bool,
    multi: PropTypes.bool,
    loadOptions: PropTypes.func,
    filterOptions: PropTypes.func,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func,
  },

  render() {
    const { onChange, input, label, meta: { touched, error }, ...custom } = this.props;
    const reactSelectToReduxForm = event => {
      if (input.onChange) {
        input.onChange(
        Array.isArray(event)
        ? event.map(e => e.value || [])
        : (event && event.value) || null
        );
      }
      if (typeof onChange === 'function') {
        onChange();
      }
    };
    return (
      <div className="form-group">
        <label htmlFor={input.name} className="col-sm-2 control-label" >
          { label }
        </label>
        <div className="col-sm-10">
          {
            typeof custom.loadOptions === 'function' ?
              <Select.Async
                {...input}
                {...custom}
                noResultsText={'En attente de résultats...'}
                onBlur={() => { input.onBlur(input.value); }}
                onChange={reactSelectToReduxForm}
              />
            : <Select
              {...input}
              {...custom}
              noResultsText={'En attente de résultats...'}
              onBlur={() => input.onBlur(input.value)}
              onChange={reactSelectToReduxForm}
            />
          }
          { touched && error }
        </div>
      </div>
    );
  },
});
