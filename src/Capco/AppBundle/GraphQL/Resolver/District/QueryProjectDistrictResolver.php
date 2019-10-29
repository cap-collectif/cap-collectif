<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class QueryProjectDistrictResolver implements ResolverInterface
{
    protected $projectDistrictRepository;
    private $logger;

    public function __construct(
        ProjectDistrictRepository $projectDistrictRepository,
        LoggerInterface $logger
    ) {
        $this->projectDistrictRepository = $projectDistrictRepository;
        $this->logger = $logger;
    }

    public function __invoke(Argument $args): ConnectionInterface
    {
        $name = $args['name'] ?? null;

        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($name) {
                $results = $this->projectDistrictRepository->getWithPagination(
                    $offset,
                    $limit,
                    $name
                );

                return $results->getIterator()->getArrayCopy();
            });

            return $paginator->auto($args, $this->projectDistrictRepository->countAll($name));
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find events');
        }
    }
}
