<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\OfficialResponseRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalOfficialResponseResolver implements ResolverInterface
{
    private OfficialResponseRepository $repository;

    public function __construct(OfficialResponseRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Proposal $proposal, ?User $viewer = null): ?OfficialResponse
    {
        if ($viewer && $viewer->isAdmin()) {
            return $this->repository->getByProposal($proposal, false);
        }

        return $this->repository->getByProposal($proposal);
    }
}
