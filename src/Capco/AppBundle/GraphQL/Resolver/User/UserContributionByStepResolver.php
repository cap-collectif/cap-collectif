<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
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
                ->get(OpinionRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(OpinionVersionRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(ArgumentRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(SourceRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(OpinionVoteRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(ArgumentVoteRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(SourceVoteRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(OpinionVersionVoteRepository::class)
                ->countByAuthorAndStep($user, $step);
        }
        if ($step instanceof CollectStep) {
            $totalCount += $this->container
                ->get(ProposalRepository::class)
                ->countByAuthorAndStep($user, $step);
            $totalCount += $this->container
                ->get(ProposalCollectVoteRepository::class)
                ->countByAuthorAndStep($user, $step);
        }
        if ($step instanceof SelectionStep) {
            $totalCount += $this->container
                ->get(ProposalSelectionVoteRepository::class)
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
