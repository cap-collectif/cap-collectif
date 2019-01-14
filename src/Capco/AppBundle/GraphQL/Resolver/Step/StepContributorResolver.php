<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class StepContributorResolver implements ResolverInterface
{
    private $userSearch;
    private $logger;
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;

    public function __construct(
        UserSearch $userSearch,
        LoggerInterface $logger,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository
    ) {
        $this->userSearch = $userSearch;
        $this->logger = $logger;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
    }

    public function __invoke(AbstractStep $step, Arg $args): Connection
    {
        $totalCount = 0;
        $paginator = new Paginator(function (int $offset, int $limit) use (&$totalCount, $step) {
            try {
                $value = $this->userSearch->getContributorByStep($step, $offset, $limit);
                $contributors = $value['results'];
                $totalCount = $value['totalCount'];

                return $contributors;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find contributors failed.');
            }
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        $connection->{'anonymousCount'} = $this->getAnonymousVote($step);

        return $connection;
    }

    private function getAnonymousVote(AbstractStep $step): int
    {
        if (!$step instanceof CollectStep && !$step instanceof SelectionStep) {
            return 0;
        }

        return $step instanceof CollectStep
            ? $this->proposalCollectVoteRepository->getAnonymousVotesCountByStep($step)
            : $this->proposalSelectionVoteRepository->getAnonymousVotesCountByStep($step);
    }
}
