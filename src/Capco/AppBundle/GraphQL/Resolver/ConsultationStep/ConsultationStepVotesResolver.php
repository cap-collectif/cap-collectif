<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Argument as Args;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class ConsultationStepVotesResolver implements QueryInterface
{
    private VoteSearch $voteSearch;
    private LoggerInterface $logger;

    public function __construct(VoteSearch $voteSearch, LoggerInterface $logger)
    {
        $this->voteSearch = $voteSearch;
        $this->logger = $logger;
    }

    public function __invoke(ConsultationStep $consultationStep, Args $args): ConnectionInterface
    {
        if (empty($args->getArrayCopy())) {
            $args = new Argument([
                'first' => 0,
            ]);
        }
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $consultationStep
        ) {
            try {
                return $this->voteSearch->searchConsultationStepVotes(
                    $consultationStep,
                    $limit,
                    $cursor
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException($exception->getMessage());
            }
        });

        return $paginator->auto($args);
    }
}
