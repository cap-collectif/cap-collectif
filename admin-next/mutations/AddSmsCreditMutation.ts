import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
  AddSmsCreditMutation,
  AddSmsCreditMutationResponse,
  AddSmsCreditMutationVariables,
} from '@relay/AddSmsCreditMutation.graphql';

const mutation = graphql`
    mutation AddSmsCreditMutation($input: AddSmsCreditInput!)
    @raw_response_type
    {
        addSmsCredit(input: $input) {
            errorCode
            smsCredit {
                amount
            }
        }
    }
`;

const commit = (
  variables: AddSmsCreditMutationVariables,
): Promise<AddSmsCreditMutationResponse> =>
  commitMutation<AddSmsCreditMutation>(environment, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
        const smsCountAdded = variables.input.amount;

        const rootFields = store.getRoot();
        const smsAnalytics = rootFields.getLinkedRecord('smsAnalytics');
        if (!smsAnalytics) return;

        /* Update Total credit */
        const totalCredit = Number(smsAnalytics.getValue('totalCredits'))
        smsAnalytics.setValue(totalCredit + smsCountAdded, 'totalCredits');

        /* Update Remaining credit */
        const remainingCredits = smsAnalytics.getLinkedRecord('remainingCredits');
        if(!remainingCredits) return null;

        const countRemainingCredits = Number(remainingCredits.getValue('amount'));
        remainingCredits.setValue(countRemainingCredits + smsCountAdded, 'amount');
    },
    updater: (store) => {
        const payload = store.getRootField('addSmsCredit');
        if (!payload) return;
        const errorCode = payload.getValue('errorCode');
        if (errorCode) return;

        const smsCreditUpdated = payload.getLinkedRecord('smsCredit');
        if(!smsCreditUpdated) return;

        const smsCountAdded = Number(smsCreditUpdated.getValue('amount'));

        const rootFields = store.getRoot();
        const smsAnalytics = rootFields.getLinkedRecord('smsAnalytics');
        if (!smsAnalytics) return;

        /* Update Total credit */
        const totalCredit = Number(smsAnalytics.getValue('totalCredits'))
        smsAnalytics.setValue(totalCredit + smsCountAdded, 'totalCredits');

        /* Update Remaining credit */
        const remainingCredits = smsAnalytics.getLinkedRecord('remainingCredits');
        if(!remainingCredits) return null;

        const countRemainingCredits = Number(remainingCredits.getValue('amount'));
        remainingCredits.setValue(countRemainingCredits + smsCountAdded, 'amount');
    }
  });

export default { commit };
