// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { changeTerm } from '../../../redux/modules/project';
import Input from '../../Form/ReactBootstrapInput';

type Props = {
  dispatch: Function,
};

type State = {
  termInputValue: string,
  value?: string,
};

class ProjectListSearch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { termInputValue: '' };
  }

  handleSubmit = (e: SyntheticInputEvent<HTMLButtonElement>) => {
    const { dispatch } = this.props;
    const { termInputValue } = this.state;
    e.preventDefault();
    const value = termInputValue.length > 0 ? termInputValue : null;
    dispatch(changeTerm(value));
  };

  handleChangeTermInput = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ termInputValue: e.target.value });
  };

  render() {
    const { value } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          id="project-search-input"
          type="text"
          placeholder="navbar.search"
          buttonAfter={
            <Button id="project-search-button" type="submit">
              <i className="cap cap-magnifier" />
            </Button>
          }
          groupClassName="project-search-group pull-right w-100"
          value={value}
          onChange={this.handleChangeTermInput}
        />
      </form>
    );
  }
}

export default connect()(ProjectListSearch);
