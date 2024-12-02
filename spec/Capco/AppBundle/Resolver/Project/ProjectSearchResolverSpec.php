<?php

namespace spec\Capco\AppBundle\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Resolver\Project\ProjectSearchParameters;
use Capco\AppBundle\Resolver\Project\ProjectSearchResolver;
use Doctrine\ORM\Tools\Pagination\Paginator;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class ProjectSearchResolverSpec extends ObjectBehavior
{
    public function let(ProjectRepository $repository)
    {
        $this->beConstructedWith($repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProjectSearchResolver::class);
    }

    public function it_should_get_an_array_of_all_projects_with_default_filters(
        ProjectRepository $projectRepository,
        ProjectSearchParameters $projectSearchParameters,
        Paginator $paginator,
        \ArrayIterator $arrayIterator
    ) {
        $projects = $this->getSampleArrayOfProjects();

        $arrayIterator->getArrayCopy()->willReturn($projects['projects']);
        $paginator->count()->willReturn(2);
        $paginator->getIterator()->willReturn($arrayIterator);

        $projectRepository
            ->getSearchResults(0, 1, null, null, null, null, null)
            ->willReturn($paginator)
        ;

        $projectSearchParameters
            ->setElements(Argument::type('int'))
            ->willReturn($projectSearchParameters)
        ;
        $projectSearchParameters
            ->setPage(Argument::type('int'))
            ->willReturn($projectSearchParameters)
        ;

        $projectSearchParameters->toArray()->willReturn([0, 1, null, null, null, null]);

        $projectSearchParameters->getElements()->willReturn(0);
        $projectSearchParameters->getPage()->willReturn(1);

        $this->beConstructedWith($projectRepository);

        $this->search($projectSearchParameters)->shouldReturn($projects);
    }

    protected function getSampleArrayOfProjects(): array
    {
        return [
            'projects' => [new Project(), new Project()],
            'page' => 1,
            'pages' => 1,
            'count' => 2,
        ];
    }
}
