<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Search\VoteSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Definition\Argument as Args;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class ConsultationVotesResolver implements ResolverInterface
{
    private VoteSearch $voteSearch;
    private LoggerInterface $logger;

    public function __construct(VoteSearch $voteSearch, LoggerInterface $logger)
    {
        $this->voteSearch = $voteSearch;
        $this->logger = $logger;
    }

    public function __invoke(Consultation $consultation, Args $args): ConnectionInterface
    {
        if (empty($args->getArrayCopy())) {
            $args = new Argument([
                'first' => 0,
            ]);
        }
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $consultation
        ) {
            try {
                return $this->voteSearch->searchConsultationVotes($consultation, $limit, $cursor);
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException($exception->getMessage());
            }
        });

        return $paginator->auto($args);
    }
}
