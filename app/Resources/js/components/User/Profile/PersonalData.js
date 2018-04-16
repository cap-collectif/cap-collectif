// @flow
import React, {Component} from 'react';
import {graphql, createFragmentContainer} from 'react-relay';
import {connect} from "react-redux";
import type {PersonalData_user} from "./__generated__/PersonalData_user.graphql";

type Props = {
  user: PersonalData_user
};

export class PersonalData extends Component<Props> {
  render() {
    const {user} = this.props;
    return (
      <div>
      </div>
    );
  };
}

const container = connect()(PersonalData);
export default createFragmentContainer(
  container,
  graphql`
    fragment PersonalData_user on User {
      username
      firstname
      lastname
      dateOfBirth
      phone
      address
      address2
      zipCode
      city
    }
  `,
);