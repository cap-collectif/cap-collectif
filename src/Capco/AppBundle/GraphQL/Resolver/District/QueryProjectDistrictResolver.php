<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
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

    public function __invoke(Argument $args): Connection
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) {
                $results = $this->projectDistrictRepository->getWithPagination($offset, $limit);

                return $results->getIterator()->getArrayCopy();
            });

            return $paginator->auto($args, function () {
                return $this->projectDistrictRepository->countAll();
            });
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find events');
        }
    }
}
