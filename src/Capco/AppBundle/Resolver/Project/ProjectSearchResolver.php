<?php
namespace Capco\AppBundle\Resolver\Project;

use Capco\AppBundle\Repository\ProjectRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProjectSearchResolver
{
    protected $projectRepository;

    public function __construct(ProjectRepository $projectRepository)
    {
        $this->projectRepository = $projectRepository;
    }

    public function search(ProjectSearchParameters $projectSearchParameters, $user = null): array
    {
        $projects = $this->getProjects($projectSearchParameters, $user);
        $count = $projects->count();

        return [
            'projects' => $projects->getIterator()->getArrayCopy(),
            'page' => $projectSearchParameters->getPage(),
            'pages' =>
                $projectSearchParameters->getElements() > 0
                    ? ceil($count / $projectSearchParameters->getElements())
                    : 1,
            'count' => $count,
        ];
    }

    protected function getProjects(
        ProjectSearchParameters $projectSearchParameters,
        $user
    ): Paginator {
        $params = array_merge($projectSearchParameters->toArray(), [$user]);

        return $this->projectRepository->getSearchResults(...$params);
    }
}
