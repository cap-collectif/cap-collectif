<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class IsViewerAnEvaluerResolver implements ResolverInterface
{
    private $proposalRepository;

    public function __construct(ProposalRepository $proposalRepository)
    {
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke(Proposal $proposal, $user): bool
    {
        return $user instanceof User
            ? $this->proposalRepository->isViewerAnEvaluer($proposal, $user)
            : false;
    }
}
