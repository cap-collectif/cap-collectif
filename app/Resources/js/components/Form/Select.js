import React from 'react';
import Select from 'react-select';

export const renderSelect = ({ input }) => // eslint-disable-line
  <div className="form-group">
    <label htmlFor={input.name} className="col-sm-2 control-label">{ input.label }</label>
    <div className="col-sm-10">
      {
        typeof input.loadOptions === 'function'
          ? <Select.Async {...input} onBlur={() => { input.onBlur(input.value); }} />
          : <Select {...input} onBlur={() => input.onBlur(input.value)} />
      }
    </div>
  </div>;
