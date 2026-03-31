<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Search\UserSearch;
use Capco\AppBundle\Service\SelectionStepContributorSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class StepContributorResolver implements QueryInterface
{
    public function __construct(
        private readonly UserSearch $userSearch,
        private readonly LoggerInterface $logger,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly SelectionStepContributorSearch $selectionStepContributorSearch
    ) {
    }

    public function __invoke(AbstractStep $step, Arg $args): ConnectionInterface
    {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use ($step) {
            try {
                if ($step instanceof SelectionStep) {
                    return $this->selectionStepContributorSearch->findContributors(
                        $step,
                        $limit,
                        $cursor
                    );
                }

                return $this->userSearch->getContributorByStep($step, $limit, $cursor);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find contributors failed.');
            }
        });

        $connection = $paginator->auto($args);
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
