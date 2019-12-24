// @flow
import * as React from 'react';
import classNames from 'classnames';
import RankingList from './RankingList/RankingList';
import ButtonBody from '../../Reply/Form/ButtonBody';

export type Field = {
  id: string,
  label: string,
  description?: string,
  image?: {
    url: string,
  },
};

export type FieldsProps = {
  id: string,
  choices: Array<Field>,
  values: Array<Field> | null,
  helpText?: string,
  description?: string,
};

type Props = {
  id: string,
  field: FieldsProps,
  getGroupStyle: Function,
  renderFormErrors: Function,
  onChange: Function,
  disabled?: boolean,
  label?: any,
  labelClassName: string,
};

class Ranking extends React.Component<Props> {
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
    ranking = ranking.map(({ label }) => label);
    onChange(ranking);
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
        {field.helpText && <span className="help-block">{field.helpText}</span>}
        {field.description && (
          <div style={{ paddingTop: 15, paddingBottom: 25 }}>
            <ButtonBody body={field.description || ''} />
          </div>
        )}

        <RankingList dataForm={field} onChange={this.handleRankingChange} isDisabled={disabled} />

        {renderFormErrors(field.id)}
      </div>
    );
  }
}

export default Ranking;
