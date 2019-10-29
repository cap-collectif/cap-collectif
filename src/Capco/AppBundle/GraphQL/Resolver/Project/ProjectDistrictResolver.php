<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectDistrictPositionerRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectDistrictResolver implements ResolverInterface
{
    private $positionerRepository;

    public function __construct(ProjectDistrictPositionerRepository $positionerRepository)
    {
        $this->positionerRepository = $positionerRepository;
    }

    public function __invoke(Project $project, Argument $args): ConnectionInterface
    {
        $totalCount = $this->positionerRepository->count(['project' => $project]);
        $paginator = new Paginator(function (int $offset, int $limit) use ($project) {
            $districts = [];
            $positioners = $this->positionerRepository->findBy(
                ['project' => $project->getId()],
                ['position' => 'ASC'],
                $limit,
                $offset
            );
            foreach ($positioners as $positioner) {
                $districts[] = $positioner->getDistrict();
            }

            return $districts;
        });

        return $paginator->auto($args, $totalCount);
    }
}
