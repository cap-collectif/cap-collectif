// @flow
import * as React from 'react';
import classNames from 'classnames';
import RankingBlock from './RankingBlock';
import ButtonBody from '../Reply/Form/ButtonBody';

type Props = {
  id: string,
  field: Object,
  getGroupStyle: Function,
  renderFormErrors: Function,
  onChange: Function,
  onBlur?: Function,
  disabled?: boolean,
  label?: any,
  labelClassName: string,
};

class Ranking extends React.Component<Props> {
  static displayName = 'Ranking';

  static defaultProps = {
    disabled: false,
    labelClassName: '',
  };

  rankingBlock: ?React.Component<*>;

  empty = () => {
    // $FlowFixMe
    this.rankingBlock
      .getDecoratedComponentInstance()
      .getDecoratedComponentInstance()
      .reset();
  };

  handleRankingChange = (ranking: Array<Object>) => {
    const { onChange } = this.props;
    const values = [];
    ranking.map(item => values.push(item.label));

    onChange(values);
  };

  render() {
    const {
      field,
      id,
      getGroupStyle,
      disabled,
      label,
      labelClassName,
      renderFormErrors,
    } = this.props;
    const labelClasses = {
      'control-label': true,
      [labelClassName]: true,
    };

    return (
      <div className={`form-group ${getGroupStyle(field.id)}`} id={id}>
        {label && (
          <label htmlFor={id} className={classNames(labelClasses)}>
            {label}
          </label>
        )}
        {field.helpText ? <span className="help-block">{field.helpText}</span> : null}
        {field.description && (
          <div style={{ paddingTop: 15, paddingBottom: 25 }}>
            <ButtonBody body={field.description || ''} />
          </div>
        )}
        <RankingBlock
          ref={c => {
            this.rankingBlock = c;
          }}
          field={field}
          disabled={disabled}
          onBlur={this.props.onBlur}
          onRankingChange={this.handleRankingChange}
        />
        {renderFormErrors(field.id)}
      </div>
    );
  }
}

export default Ranking;
