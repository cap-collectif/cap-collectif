<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\AbstractVote as Vote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Capco\AppBundle\Resolver\VoteResolver;
use Twig\Extension\RuntimeExtensionInterface;

class VoteRuntime implements RuntimeExtensionInterface
{
    protected $voteResolver;
    protected $proposalStepVotesResolver;

    public function __construct(
        VoteResolver $voteResolver,
        ProposalStepVotesResolver $proposalStepVotesResolver
    ) {
        $this->voteResolver = $voteResolver;
        $this->proposalStepVotesResolver = $proposalStepVotesResolver;
    }

    public function getRelatedObjectUrl(Vote $vote, $absolute = false)
    {
        return $this->voteResolver->getRelatedObjectUrl($vote, $absolute);
    }

    public function getRelatedObjectAdminUrl(Vote $vote, $absolute = false): string
    {
        return $this->voteResolver->getRelatedObjectAdminUrl($vote, $absolute);
    }

    public function getRelatedObject(Vote $vote)
    {
        return $this->voteResolver->getRelatedObject($vote);
    }

    public function hasVotableStepNotFuture(Project $project): bool
    {
        return $this->proposalStepVotesResolver->hasVotableStepNotFuture($project);
    }
}
