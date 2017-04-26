// @flow
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../../createRelayEnvironment';

class ConsultationPropositionBox extends Component {
  render() {
    return (
      <div>
        <h2>Liste d'opinions</h2>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ConsultationPropositionBoxQuery {
              contributions(consultation: 5) {
                id
              }
            }
          `}
          render={({ error, props }) => {
            if (error) {
              return <div>{error.message}</div>;
            }
            if (props) {
              console.log(props);
              return <div />;
            }
            return <div>Loading</div>;
          }}
        />
      </div>
    );
  }
}

// const Feed = ({ feed }) => (
//   <ol>
//     {feed.map(entry => (
//       <li key={`${entry.repository.owner.login  }/${  entry.repository.name}`}>
//         {entry.repository.owner.login}/{entry.repository.name}: {entry.repository.stargazers_count} Stars
//       </li>
//     ))}
//   </ol>
// )

export default ConsultationPropositionBox;
