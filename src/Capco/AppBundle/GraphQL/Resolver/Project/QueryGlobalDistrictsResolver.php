<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class QueryGlobalDistrictsResolver implements QueryInterface
{
    public function __construct(private readonly GlobalDistrictRepository $globalDistrictRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Argument $args): array
    {
        try {
            return $this->globalDistrictRepository->findAll();
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find project district');
        }
    }
}
