<?php

namespace Capco\Tests\Resolver;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\User\ProjectOwnerProjectsResolver;
use Capco\AppBundle\Search\ProjectSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use PHPUnit\Framework\TestCase;

/**
 * @covers
 *
 * @internal
 */
class ProjectOwnerProjectResolverTest extends TestCase
{
    public function testShouldFetchUserProjects(): void
    {
        $orderBy = [
            'field' => 'PUBLISHED_AT',
            'direction' => 'ASC',
        ];

        $affiliations = ['OWNER'];
        $query = 'project';
        $offset = 0;
        $limit = 101;

        $filters = [];

        $args = new Argument([
            'first' => 100,
            'orderBy' => $orderBy,
            'affiliations' => $affiliations,
            'query' => $query,
        ]);

        $user = new User();
        $project = new Project();

        $response = [
            'count' => 1,
            'projects' => [$project],
        ];

        $projectSearch = $this->createMock(ProjectSearch::class);

        $projectSearch
            ->expects($this->exactly(1))
            ->method('searchProjects')
            ->with($offset, $limit, $orderBy, $query, $filters, $affiliations, $user)
            ->willReturn($response)
        ;

        $projectOwnerProjectsResolver = new ProjectOwnerProjectsResolver($projectSearch);

        $actual = $projectOwnerProjectsResolver->__invoke($user, $args);

        self::assertInstanceOf(Connection::class, $actual);
        self::assertEquals(1, $actual->getTotalCount());
        self::assertEquals($actual->getEdges()[0]->getNode(), $project);
    }
}
