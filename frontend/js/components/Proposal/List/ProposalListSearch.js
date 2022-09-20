// @flow
import * as React from 'react';
import { injectIntl } from 'react-intl';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import ClearableInput from '~ui/Form/Input/ClearableInput';
import { changeTerm } from '~/redux/modules/proposal';
import type { GlobalState, Dispatch } from '~/types';

type Props = {|
  +dispatch: Dispatch,
  +terms: string,
  +intl: Object,
|};

export const ProposalListSearch = ({ dispatch, intl, terms }: Props) => {
  const [hasSearchTermChanged, setHasSearchTermChanged] = React.useState(false);
  const onInputChange = debounce((e: SyntheticInputEvent<HTMLInputElement>) => {
    const term = e.target.value;
    dispatch(changeTerm(term || ''));
  }, 1500);

  const handleClear = () => {
    dispatch(changeTerm(''));
  };

  return (
    <form style={{ marginBottom: '15px' }}>
      <ClearableInput
        id="proposal-search-input"
        name="search"
        ariaLabel={intl.formatMessage({ id: 'global.menu.search' })}
        type="text"
        icon={<i className="cap cap-magnifier" />}
        placeholder={intl.formatMessage({ id: 'proposal.search' })}
        onChange={(e: SyntheticInputEvent<HTMLInputElement>) => {
          e.persist();
          setHasSearchTermChanged(true);
          onInputChange(e);
        }}
        onClear={handleClear}
        initialValue={terms}
        autoFocus={hasSearchTermChanged}
      />
    </form>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  terms: state.proposal.terms ? state.proposal.terms : '',
});

const container = injectIntl(ProposalListSearch);

export default connect<any, any, _, _, _, _>(mapStateToProps)(container);
