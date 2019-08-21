// @flow
import * as React from 'react';
import ReactToggle from 'react-toggle';

type Props = {
  input: Object,
  meta: Object,
  label: string,
  roledescription?: string,
  disabled: boolean,
  id: string,
  labelSide: 'RIGHT' | 'LEFT',
};

export class Toggle extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
    labelSide: 'LEFT',
  };

  render() {
    const {
      input,
      labelSide,
      label,
      id,
      disabled,
      roledescription,
      meta: { touched, error },
    } = this.props;
    return (
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center' }}>
          {labelSide === 'RIGHT' && <span className="ml-10">{label}</span>}
          <ReactToggle
            id={id}
            aria-labelledby={label}
            aria-roledescription={roledescription}
            disabled={disabled}
            checked={input.value}
            onChange={input.onChange}
          />
          {labelSide === 'LEFT' && <span className="ml-10">{label}</span>}
        </label>
        {touched && error}
      </div>
    );
  }
}

export default Toggle;
