<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Search\ReplySearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class QuestionnaireAdminRepliesResolver implements QueryInterface
{
    private readonly ReplySearch $replySearch;
    private readonly LoggerInterface $logger;

    public function __construct(ReplySearch $replySearch, LoggerInterface $logger)
    {
        $this->replySearch = $replySearch;
        $this->logger = $logger;
    }

    public function __invoke(
        Questionnaire $questionnaire,
        Arg $args,
        ?User $viewer = null
    ): ConnectionInterface {
        $filtersStatus = $args->offsetGet('filterStatus') ?? [];
        $term = $args->offsetGet('term') ?? null;
        $orderBy = $args->offsetGet('orderBy') ?? null;

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $questionnaire,
            $term,
            $orderBy,
            $filtersStatus
        ) {
            if (!$questionnaire->getStep() || empty($filtersStatus)) {
                return new ElasticsearchPaginatedResult([], [], 0);
            }

            try {
                return $this->replySearch->getAdminRepliesByStep(
                    $questionnaire->getStep()->getId(),
                    $filtersStatus,
                    $limit,
                    $cursor,
                    $term,
                    $orderBy
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('An error occured while retrieving replies.');
            }
        });

        return $paginator->auto($args);
    }
}
