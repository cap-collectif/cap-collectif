<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalForm;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

class DeleteProposalFormMutation extends AbstractProposalFormMutation
{
    use MutationTrait;

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $id = $input->offsetGet('id');
            $proposalForm = $this->getProposalForm($id, $viewer);
            $this->em->remove($proposalForm);
            $this->em->flush();
        } catch (UserError $error) {
            return ['error' => $error->getMessage()];
        }

        return ['deletedProposalFormId' => $id];
    }
}
