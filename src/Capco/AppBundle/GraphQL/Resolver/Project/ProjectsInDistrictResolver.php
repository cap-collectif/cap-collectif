<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Repository\ProjectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProjectsInDistrictResolver implements QueryInterface
{
    public function __construct(private readonly ProjectRepository $projectRepository)
    {
    }

    public function __invoke(
        GlobalDistrict $district,
        Argument $args,
        $viewer
    ): ConnectionInterface {
        $totalCount = $this->projectRepository->countByDistrict($district, $viewer);
        $paginator = new Paginator(function (int $offset, int $limit) use ($district, $viewer) {
            return $this->projectRepository
                ->findByDistrict($district, $viewer, $offset, $limit)
                ->getIterator()
                ->getArrayCopy()
            ;
        });

        return $paginator->auto($args, $totalCount);
    }
}
