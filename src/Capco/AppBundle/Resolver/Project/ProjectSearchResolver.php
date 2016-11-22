<?php

namespace Capco\AppBundle\Resolver\Project;

use Capco\AppBundle\Repository\ProjectRepository;

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
        $count = count($projects);

        return [
            'projects' => $projects,
            'page' => $projectSearchParameters->getPage(),
            'pages' => $projectSearchParameters->getElements() > 0
                ? ceil($count / $projectSearchParameters->getElements())
                : 1,
            'count' => $count,
        ];
    }

    protected function getProjects(ProjectSearchParameters $projectSearchParameters): array
    {
        return call_user_func_array(
            [$this->projectRepository, 'getSearchResults'],
            $projectSearchParameters->toArray()
        ) ?? [];
    }
}
