<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class QueryGlobalDistrictResolver implements QueryInterface
{
    public function __construct(
        protected GlobalDistrictRepository $globalDistrictRepository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $name = $args['name'] ?? null;

        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($name) {
                $results = $this->globalDistrictRepository->getWithPagination(
                    $offset,
                    $limit,
                    $name
                );

                return $results->getIterator()->getArrayCopy();
            });

            return $paginator->auto($args, $this->globalDistrictRepository->countAll($name));
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find events');
        }
    }
}
