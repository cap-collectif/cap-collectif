// @flow
import * as React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { changeTerm } from '../../../redux/modules/proposal';
import Input from '../../Form/Input';
import type { GlobalState, Dispatch } from '../../../types';

type Props = {|
  +dispatch: Dispatch,
  +terms: string,
  +intl: Object,
|};

type State = {|
  +terms: string,
|};

export class ProposalListSearch extends React.Component<Props, State> {
  _input: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      terms: props.terms,
    };

    this._input = React.createRef();
  }

  handleSubmit = (e: Event) => {
    const { dispatch } = this.props;

    e.preventDefault();
    let value = this._input.current.getValue();
    value = value.length > 0 ? value : null;
    if (value) {
      dispatch(changeTerm(value));
    }
  };

  handleChange = (event: $FlowFixMe) => {
    this.setState({ terms: event.target.value });
  };

  render() {
    const { intl } = this.props;
    const { terms } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          id="proposal-search-input"
          type="text"
          ariaLabel={intl.formatMessage({ id: 'project.searchform.search' })}
          ref={this._input}
          placeholder="proposal.search"
          buttonAfter={
            <Button id="proposal-search-button" type="submit">
              <i className="cap cap-magnifier" />
            </Button>
          }
          value={terms}
          onChange={this.handleChange}
        />
      </form>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  terms: state.proposal.terms ? state.proposal.terms : '',
});

const container = injectIntl(ProposalListSearch);

export default connect(mapStateToProps)(container);
