<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectPaperVoteTotalCountResolver implements ResolverInterface
{
    private ProposalStepPaperVoteCounterRepository $repository;

    public function __construct(ProposalStepPaperVoteCounterRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Project $project)
    {
        return $this->repository->countVotesByProject($project);
    }
}
