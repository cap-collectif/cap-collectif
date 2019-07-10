<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\AbstractVote as Vote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Capco\AppBundle\Resolver\VoteResolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class VoteExtension extends AbstractExtension
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

    public function getFunctions(): array
    {
        return [
            new TwigFunction('capco_vote_object_url', [$this, 'getRelatedObjectUrl']),
            new TwigFunction('capco_vote_object', [$this, 'getRelatedObject']),
            new TwigFunction('capco_vote_object_admin_url', [$this, 'getRelatedObjectAdminUrl']),
            new TwigFunction('capco_has_votable_step_not_future', [
                $this,
                'hasVotableStepNotFuture'
            ])
        ];
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
