<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Capco\AppBundle\Entity\Project;
use Capco\UserBundle\Entity\User;

class ProposalExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(ProposalStepVotesResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getName()
    {
        return 'capco_proposal_helper';
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('proposal_votes_list', [$this, 'votesList']),
        ];
    }

    public function votesList(Project $project, User $user = null)
    {
        return $this->resolver->getUserVotesByStepIdForProject($project, $user);
    }
}
