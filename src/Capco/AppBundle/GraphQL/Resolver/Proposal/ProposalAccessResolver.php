<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalAccessResolver implements QueryInterface
{
    /**
     * @return array{canEdit: bool, canDelete: bool}
     */
    public function __invoke(Proposal $proposal, Argument $args, ?User $viewer = null): array
    {
        if (!$viewer) {
            return [
                'canEdit' => false,
                'canDelete' => false,
            ];
        }

        if ($viewer->isAdmin()) {
            return [
                'canEdit' => true,
                'canDelete' => true,
            ];
        }

        if ($viewer->getOrganization() && $proposal->getProposalForm()->getOwner() === $viewer->getOrganization()) {
            return [
                'canEdit' => true,
                'canDelete' => true,
            ];
        }

        $step = $proposal->getStep();

        if ($viewer !== $proposal->getAuthor()) {
            return [
                'canEdit' => false,
                'canDelete' => false,
            ];
        }

        return [
            'canEdit' => !$step->getPreventProposalEdit(),
            'canDelete' => !$step->getPreventProposalDelete(),
        ];
    }
}
