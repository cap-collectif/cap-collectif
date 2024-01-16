<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class QueryProjectDistrictsResolver implements QueryInterface
{
    private $projectDistrictRepository;
    private $logger;

    public function __construct(
        ProjectDistrictRepository $projectDistrictRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->projectDistrictRepository = $projectDistrictRepository;
    }

    public function __invoke(Argument $args): array
    {
        try {
            return $this->projectDistrictRepository->findAll();
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find project district');
        }
    }
}
