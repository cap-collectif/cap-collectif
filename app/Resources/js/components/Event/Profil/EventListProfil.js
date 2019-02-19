// @flow
import React from 'react';

type Props = {
  userId?: string,
  isAuthenticated?: boolean,
};

class EventListProfil extends React.Component<Props> {
  render() {
    return (
      <div>
        Event List Profil: {this.props.userId} | {this.props.isAuthenticated}
      </div>
    );
  }
}

export default EventListProfil;
