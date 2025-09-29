<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

/**
 * @deprecated this is our legacy evaluation tool
 */
class ProposalViewerIsAnEvaluerResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalRepository $proposalRepository
    ) {
    }

    public function __invoke(Proposal $proposal, $viewer): bool
    {
        return $viewer instanceof User
            ? $this->proposalRepository->isViewerAnEvaluer($proposal, $viewer)
            : false;
    }
}
