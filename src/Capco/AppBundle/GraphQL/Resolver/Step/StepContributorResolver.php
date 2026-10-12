<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Search\UserSearch;
use Capco\AppBundle\Service\SelectionStepContributorSearch;
use Capco\UserBundle\Entity\User;
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
        private readonly SelectionStepContributorSearch $selectionStepContributorSearch,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
    }

    public function __invoke(AbstractStep $step, Arg $args, ?User $viewer = null, ?\ArrayObject $context = null): ConnectionInterface
    {
        if (true !== ($context['disable_acl'] ?? false) && !$step->canDisplay($viewer)) {
            return ConnectionBuilder::empty(['anonymousCount' => 0]);
        }
        if ($step instanceof QuestionnaireStep && !$this->resultsAccess->canViewResults($step->getQuestionnaire(), $context)) {
            $connection = ConnectionBuilder::empty(['anonymousCount' => 0]);
            $connection->setTotalCount($this->userSearch->getContributorByStep($step, 0)->getTotalCount());

            return $connection;
        }

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
