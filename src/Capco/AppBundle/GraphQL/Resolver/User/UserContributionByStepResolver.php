<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Overblog\GraphQLBundle\Definition\Argument;

class UserContributionByStepResolver implements ResolverInterface
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function __invoke(User $user, AbstractStep $step, Argument $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) {
            return [];
        });

        $totalCount = 0;
        if ($step instanceof ConsultationStep) {
            $totalCount += $this->container
                ->get('capco.opinion.repository')
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get('capco.opinion_version.repository')
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(ArgumentRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get('capco.source.repository')
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get('capco.opinion_vote.repository')
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(ArgumentVoteRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get('capco.source_vote.repository')
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get('capco.opinion_version_vote.repository')
                ->countByAuthorAndStep($user, $step);
        }
        if ($step instanceof CollectStep) {
            $totalCount += $this->container
                ->get('capco.proposal.repository')
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get('capco.proposal_collect_vote.repository')
                ->countByAuthorAndStep($user, $step);
        }
        if ($step instanceof SelectionStep) {
            $totalCount += $this->container
                ->get('capco.proposal_selection_vote.repository')
                ->countByAuthorAndStep($user, $step);
        }
        if ($step instanceof QuestionnaireStep) {
            $totalCount += $this->container
                ->get(ReplyRepository::class)
                ->countByAuthorAndStep($user, $step);
        }

        return $paginator->auto($args, $totalCount);
    }
}
