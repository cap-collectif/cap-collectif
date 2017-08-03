import React, { Component } from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
} from 'react-places-autocomplete';

type Props = {
  disabled: Boolean,
  onChange: Function,
  value: any,
  name: String,
  id: String,
  placeholder: String,
};

// eslint-disable-next-line react/prop-types
const autocompleteItem = ({ formattedSuggestion }) =>
  <div>
    <i className="cap cap-map-location" />{' '}
    <strong>{formattedSuggestion.mainText}</strong>{' '}
    <small>{formattedSuggestion.secondaryText}</small>
  </div>;

class Address extends Component<void, Props, void> {
  static defaultProps: {
    disabled: false,
  };

  resetAddressField() {
    // this.setState(prevState => ({
    //   form: { ...prevState.form, address: '' },
    // }));
    // this.setState(prevState => ({
    //   ...prevState,
    //   address: '',
    //   errors: {
    //     ...prevState.errors,
    //     address: [{ message: 'proposal.constraints.address' }],
    //   },
    // }));
  }

  handleAddressChange(address) {
    geocodeByAddress(address)
      .then(results => {
        const addressToSend = JSON.stringify(results);
        const addressText = results[0].formatted_address;
        console.log(address, addressToSend, addressText);
      })
      .catch(error => {
        // this.resetAddressField();
        console.error('Google places error!', error); // eslint-disable-line
      });
  }

  render() {
    const { placeholder, value, id } = this.props;
    return (
      <PlacesAutocomplete
        inputProps={{
          onChange: address => {
            console.log(address);
          },
          placeholder,
          value,
          type: 'text',
          id,
        }}
        autocompleteItem={autocompleteItem}
        onEnterKeyDown={this.handleAddressChange}
        onSelect={this.handleAddressChange}
        onError={() => {
          this.resetAddressField();
        }}
        classNames={{
          // root: `${this.state.errors.address.length > 0
          //   ? 'form-control-warning'
          //   : ''}`,
          input: 'form-control',
          autocompleteContainer: {
            zIndex: 9999,
            position: 'absolute',
            top: '100%',
            backgroundColor: 'white',
            border: '1px solid #555555',
            width: '100%',
          },
          autocompleteItem: {
            zIndex: 9999,
            backgroundColor: '#ffffff',
            padding: '10px',
            color: '#555555',
            cursor: 'pointer',
          },
          autocompleteItemActive: {
            zIndex: 9999,
            backgroundColor: '#fafafa',
          },
        }}
      />
    );
  }
}

export default Address;
