<?php
namespace Capco\AppBundle\Resolver\Project;

use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Tools\Pagination\Paginator;

class ProjectSearchResolver
{
    protected $projectRepository;

    public function __construct(ProjectRepository $projectRepository)
    {
        $this->projectRepository = $projectRepository;
    }

    public function search(ProjectSearchParameters $projectSearchParameters): array
    {
        $projects = $this->getProjects($projectSearchParameters);
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

    protected function getProjects(ProjectSearchParameters $projectSearchParameters): Paginator
    {
        // TODO in next feature, to find projects accessible by current user, parse user to query
        return $this->projectRepository->getSearchResults(...$projectSearchParameters->toArray());
    }
}
