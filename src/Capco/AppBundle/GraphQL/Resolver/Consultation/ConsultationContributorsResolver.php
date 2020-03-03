<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Search\UserSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class ConsultationContributorsResolver implements ResolverInterface
{
    private $userSearch;
    private $logger;

    public function __construct(UserSearch $userSearch, LoggerInterface $logger)
    {
        $this->userSearch = $userSearch;
        $this->logger = $logger;
    }

    public function __invoke(Consultation $consultation, Arg $args): ConnectionInterface
    {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, $limit) use (
            $consultation
        ) {
            try {
                return $this->userSearch->getContributorsByConsultation(
                    $consultation,
                    $limit,
                    $cursor
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find contributors failed.');
            }
        });

        return $paginator->auto($args);
    }
}
