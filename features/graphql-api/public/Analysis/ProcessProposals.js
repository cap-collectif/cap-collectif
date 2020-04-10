/* eslint-env jest */
const util = require('util');
const exec = util.promisify(require('child_process').exec);
import '../../_setup';

//* eslint-env jest */
const ProcessProposalsQuery = /* GraphQL */ `
  query proposalForms($proposalFormId: ID!) {
    proposalForm: node(id: $proposalFormId) {
      ... on ProposalForm {
        id
        analysisConfiguration {
          analysisStep {
            id
          }
          evaluationForm {
            id
          }
          effectiveDate
          favourableStatus {
            id
            name
          }
          unfavourableStatuses {
            id
            name
          }
          effectiveDateProcessed
        }
      }
    }
  }
`;

//TODO uncomment later

// describe('Internal| ProcessProposals', () => {
//   it('fetches the proposalFrom that will be changed', async () => {
//     await expect(
//       graphql(
//         ProcessProposalsQuery,
//         {
//           proposalFormId: 'proposalformIdf',
//         },
//         'internal',
//       ),
//     ).resolves.toMatchSnapshot();
//     const {
//       stdout,
//       stderr,
//     } = await exec(
//       'php -d memory_limit=-1 bin/console capco:process_proposals --time "2021-01-01 03:00:00" --message "No"',
//       { maxBuffer: 1024 * 1000 * 1000 },
//     );
//
//     if (stderr) {
//       console.error(`error: ${stderr}`);
//     }
//     console.log('Successfully executed process_proposal command.');
//
//     await expect(stdout).toMatch(/.*2 proposals have been processed.*/);
//
//     await expect(
//       graphql(
//         ProcessProposalsQuery,
//         {
//           proposalFormId: 'proposalformIdf',
//         },
//         'internal',
//       ),
//     ).resolves.toMatchSnapshot();
//   });
// });
