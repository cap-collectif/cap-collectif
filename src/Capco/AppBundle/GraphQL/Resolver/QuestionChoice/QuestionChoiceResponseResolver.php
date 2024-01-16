<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Search\ResponseSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class QuestionChoiceResponseResolver implements QueryInterface
{
    private ResponseSearch $responseSearch;
    private LoggerInterface $logger;

    public function __construct(ResponseSearch $responseSearch, LoggerInterface $logger)
    {
        $this->responseSearch = $responseSearch;
        $this->logger = $logger;
    }

    public function __invoke(QuestionChoice $questionChoice, Arg $args): ConnectionInterface
    {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $questionChoice
        ) {
            try {
                return $this->responseSearch->getQuestionChoiceResponses(
                    $questionChoice,
                    false,
                    $limit,
                    $cursor
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find responses of question choice failed');
            }
        });

        return $paginator->auto($args);
    }
}
