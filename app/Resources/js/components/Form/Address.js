import React, { Component } from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
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
  formName: String,
  updateAddressValue: Function,
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

  resetAddressField = () => {
    this.props.onChange(null);
    this.props.updateAddressValue(null);
  };

  handleAddressChange = address => {
    geocodeByAddress(address)
      .then(results => {
        const addressToSend = JSON.stringify(results);
        const addressText = results[0].formatted_address;
        this.props.onChange(addressText);
        this.props.updateAddressValue(addressToSend);
      })
      .catch(error => {
        this.resetAddressField();
        console.error('Google places error!', error); // eslint-disable-line
      });
  };

  render() {
    const { placeholder, value, id, onChange } = this.props;
    return (
      <PlacesAutocomplete
        inputProps={{
          onChange: address => {
            onChange(address);
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
        }}
      />
    );
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  updateAddressValue: value => {
    dispatch(change(props.formName, 'address', value));
  },
});

export default connect(null, mapDispatchToProps)(Address);
