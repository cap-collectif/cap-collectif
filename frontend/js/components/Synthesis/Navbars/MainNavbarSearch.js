import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import Input from '../../Form/Input';

type Props = {
  router?: Object,
};

type State = {
  searchTerm: string,
};

class MainNavbarSearch extends React.Component<Props, State> {
  static displayName = 'MainNavbarSearch';

  state = {
    searchTerm: '',
  };

  submit = ev => {
    ev.stopPropagation();
    ev.preventDefault();
    if (this.state.searchTerm.length > 0) {
      this.props.router.push(`search/${this.state.searchTerm}`);
    }
  };

  render() {
    const searchButton = (
      <Button type="submit" style={{ paddingTop: '7px' }} className="btn-gray">
        <i className="cap cap-magnifier" />
      </Button>
    );
    return (
      <Navbar.Form pullRight>
        <form onSubmit={this.submit}>
          <Input
            type="text"
            placeholder='global.menu.search'
            buttonAfter={searchButton}
            onChange={event => {
              this.setState({
                searchTerm: event.target.value,
              });
            }}
          />
        </form>
      </Navbar.Form>
    );
  }
}

export default MainNavbarSearch;
