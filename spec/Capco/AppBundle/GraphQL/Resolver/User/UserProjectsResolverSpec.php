<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\User\UserProjectsResolver;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Tools\Pagination\Paginator;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;

class UserProjectsResolverSpec extends ObjectBehavior
{
    public function let(ProjectRepository $projectRepository, LoggerInterface $logger)
    {
        $this->beConstructedWith($projectRepository, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UserProjectsResolver::class);
    }

    public function it_should_fetch_user_projects(
        User $user,
        ProjectRepository $projectRepository,
        Paginator $paginator,
        \ArrayIterator $arrayIterator,
        Project $project
    ) {
        $orderBy = [
            'field' => 'PUBLISHED_AT',
            'direction' => 'ASC',
        ];

        $totalCount = 20;

        $affiliations = ['OWNER'];
        $query = 'project';
        $orderByField = 'publishedAt';
        $orderByDirection = 'ASC';

        $args = new Arg([
            'first' => 100,
            'after' => null,
            'orderBy' => $orderBy,
            'affiliations' => $affiliations,
            'query' => $query,
        ]);

        $projectRepository
            ->getByUserPublicPaginated(
                $user,
                0,
                101,
                $affiliations,
                $query,
                $orderByField,
                $orderByDirection
            )
            ->shouldBeCalled()
            ->willReturn($paginator);

        $paginator
            ->getIterator()
            ->shouldBeCalled()
            ->willReturn($arrayIterator);
        $arrayIterator->getArrayCopy()->willReturn([$project]);

        $projectRepository
            ->countPublicPublished($user, $affiliations, $query, $orderByField, $orderByDirection)
            ->shouldBeCalled()
            ->willReturn($totalCount);

        $this->__invoke($user, $args)->shouldReturnConnection();
    }
}
