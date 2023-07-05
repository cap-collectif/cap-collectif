<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\User\ProjectOwnerProjectsResolver;
use Capco\AppBundle\Search\ProjectSearch;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class ProjectOwnerProjectsResolverSpec extends ObjectBehavior
{
    public function let(ProjectSearch $projectSearch)
    {
        $this->beConstructedWith($projectSearch);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProjectOwnerProjectsResolver::class);
    }

    public function it_should_fetch_user_projects(
        User $user,
        ProjectSearch $projectSearch,
        Paginator $paginator,
        \ArrayIterator $arrayIterator,
        Project $project
    ) {
        $orderBy = [
            'field' => 'PUBLISHED_AT',
            'direction' => 'ASC',
        ];

        $affiliations = ['OWNER'];
        $query = 'project';
        $offset = 0;
        $limit = 101;

        $filters = [];

        $args = new Arg([
            'first' => 100,
            'orderBy' => $orderBy,
            'affiliations' => $affiliations,
            'query' => $query,
        ]);

        $response = [
            'count' => 1,
            'projects' => [$project],
        ];

        $projectSearch
            ->searchProjects($offset, $limit, $orderBy, $query, $filters, $affiliations, $user)
            ->shouldBeCalled()
            ->willReturn($response)
        ;

        $this->__invoke($user, $args)->shouldReturnConnection();
    }
}
