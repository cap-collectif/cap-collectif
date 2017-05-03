<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Capco\UserBundle\Entity\User;

class ProposalExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(ProposalStepVotesResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('proposal_votes_list', [$this, 'votesList']),
            new \Twig_SimpleFilter('credits_list_list', [$this, 'creditsLeftList']),
        ];
    }

    public function votesList(Project $project, User $user = null)
    {
        return $this->resolver->getUserVotesByStepIdForProject($project, $user);
    }

    public function creditsLeftList(Project $project, User $user = null)
    {
        return $this->resolver->getCreditsLeftByStepIdForProjectAndUser($project, $user);
    }
}
