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
    multi: PropTypes.bool.isRequired,
    loadOptions: PropTypes.func,
    filterOptions: PropTypes.func,
    isLoading: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  },

  getInitialProps() {
    return {
      multi: false,
      clearable: true,
      isLoading: false,
      onChange: () => {},
    };
  },

  render() {
    const { onChange, isLoading, input, label, multi, filterOptions, clearable, loadOptions, meta: { touched, error }, ...rest } = this.props;
    console.log(this.props);
    return (
      <div className="form-group">
        <label htmlFor={input.name} className="col-sm-2 control-label" >
          { label }
        </label>
        <div className="col-sm-10">
          {
            typeof loadOptions === 'function' ?
              <Select.Async
                {...input}
                multi={multi}
                isLoading={isLoading}
                clearable={clearable}
                loadOptions={loadOptions}
                options={rest.options}
                filterOptions={filterOptions}
                placeholder={rest.placeholder}
                noResultsText={'En attente de résultats...'}
                onBlur={() => { input.onBlur(input.value); }}
                onChange={event => {
                  if (input.onChange) {
                    input.onChange(
                    Array.isArray(event)
                    ? event.map(e => e.value)
                    : event.value
                    );
                  }
                  onChange();
                }}
              />
            : <Select
              {...input}
              multi={multi}
              isLoading={isLoading}
              clearable={clearable}
              options={rest.options}
              placeholder={rest.placeholder}
              noResultsText={'En attente de résultats...'}
              onBlur={() => input.onBlur(input.value)}
              onChange={event => {
                if (input.onChange) {
                  input.onChange(
                  Array.isArray(event)
                  ? event.map(e => e.value)
                  : event.value
                  );
                }
                onChange();
              }}
            />
          }
          { touched && error }
        </div>
      </div>
    );
  },
});
