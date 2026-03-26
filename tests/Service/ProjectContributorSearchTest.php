<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\UserOrderField;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Service\ProjectContributorSearch;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Connection;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * @internal
 * @coversNothing
 */
class ProjectContributorSearchTest extends TestCase
{
    public function testItHydratesUsersAndParticipantsInSqlOrder(): void
    {
        $connection = $this->createMock(Connection::class);
        $userRepository = $this->createMock(UserRepository::class);
        $participantRepository = $this->createMock(ParticipantRepository::class);
        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->method('isGranted')->with('ROLE_ADMIN')->willReturn(false);

        $project = $this->createMock(Project::class);
        $project->method('getId')->willReturn('project-1');

        $user = $this->createMock(User::class);
        $user->method('getId')->willReturn('user-1');

        $participant = $this->createMock(Participant::class);
        $participant->method('getId')->willReturn('participant-1');

        $connection->expects($this->once())
            ->method('fetchAllAssociative')
            ->with(
                $this->isType('string'),
                $this->callback(fn (array $params): bool => 2 === $params['limit'] && 0 === $params['offset'] && 'project-1' === $params['projectId'])
            )
            ->willReturn([
                ['contributor_type' => 'user', 'contributor_id' => 'user-1', 'total_count' => 3],
                ['contributor_type' => 'participant', 'contributor_id' => 'participant-1', 'total_count' => 3],
            ])
        ;

        $userRepository->expects($this->once())->method('hydrateFromIdsOrdered')->with(['user-1'])->willReturn([$user]);
        $participantRepository->expects($this->once())->method('hydrateFromIdsOrdered')->with(['participant-1'])->willReturn([$participant]);

        $service = new ProjectContributorSearch($connection, $userRepository, $participantRepository, $authorizationChecker);
        $result = $service->findContributors(
            $project,
            [],
            ['field' => UserOrderField::ACTIVITY, 'direction' => 'DESC'],
            2
        );

        $this->assertSame([$user, $participant], $result->getEntities());
        $this->assertSame([[0], [1]], $result->getCursors());
        $this->assertSame(3, $result->getTotalCount());
    }

    public function testItUsesCursorOffsetForNextPage(): void
    {
        $connection = $this->createMock(Connection::class);
        $userRepository = $this->createMock(UserRepository::class);
        $participantRepository = $this->createMock(ParticipantRepository::class);
        $authorizationChecker = $this->createMock(AuthorizationCheckerInterface::class);
        $authorizationChecker->method('isGranted')->with('ROLE_ADMIN')->willReturn(false);

        $project = $this->createMock(Project::class);
        $project->method('getId')->willReturn('project-1');

        $participant = $this->createMock(Participant::class);
        $participant->method('getId')->willReturn('participant-2');

        $connection->expects($this->once())
            ->method('fetchAllAssociative')
            ->with(
                $this->isType('string'),
                $this->callback(fn (array $params): bool => 1 === $params['limit'] && 2 === $params['offset'] && 'project-1' === $params['projectId'])
            )
            ->willReturn([
                ['contributor_type' => 'participant', 'contributor_id' => 'participant-2', 'total_count' => 3],
            ])
        ;

        $userRepository->expects($this->once())->method('hydrateFromIdsOrdered')->with([])->willReturn([]);
        $participantRepository->expects($this->once())->method('hydrateFromIdsOrdered')->with(['participant-2'])->willReturn([$participant]);

        $service = new ProjectContributorSearch($connection, $userRepository, $participantRepository, $authorizationChecker);
        $result = $service->findContributors(
            $project,
            [],
            ['field' => UserOrderField::ACTIVITY, 'direction' => 'DESC'],
            1,
            ElasticsearchPaginator::encodeCursor([1])
        );

        $this->assertSame([$participant], $result->getEntities());
        $this->assertSame([[2]], $result->getCursors());
        $this->assertSame(3, $result->getTotalCount());
    }
}
