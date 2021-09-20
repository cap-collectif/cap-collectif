<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\ProposalAdminType;
use Overblog\GraphQLBundle\Definition\Argument;

class CreateProposalFromBackofficeMutation extends CreateProposalMutation
{
    public function __invoke(Argument $input, $user): array
    {
        $values = $input->getArrayCopy();
        $proposalForm = $this->getProposalForm($values, $user);
        unset($values['proposalFormId']); // This only useful to retrieve the proposalForm
        $author = $this->globalIdResolver->resolve($values['author'], $user);

        $proposal = $this->createAndIndexProposal(
            $values,
            $proposalForm,
            $author,
            $author,
            false,
            ProposalAdminType::class
        );

        return ['proposal' => $proposal];
    }
}
