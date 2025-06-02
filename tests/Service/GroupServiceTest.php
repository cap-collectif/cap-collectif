<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Service\GroupService;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Monolog\Logger;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @covers
 */
class GroupServiceTest extends TestCase
{
    private UserRepository $userRepository;
    private UserGroupRepository $userGroupRepository;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->userGroupRepository = $this->createMock(UserGroupRepository::class);
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
    }

    /**
     * @dataProvider addUsersToGroupFromEmailProvider
     *
     * @param string[]                                        $emails
     * @param User[]                                          $existentUsersResult
     * @param array{userIds: string[], groupId: string}       $usersByGroupParams
     * @param UserGroup[]                                     $usersByGroupResult
     * @param array<array-key, array<string[]|User[]|User[]>> $expected
     */
    public function testAddUsersToGroupFromEmail(
        array $emails,
        Group $group,
        bool $dryRun,
        bool $isNewGroup,
        array $existentUsersResult,
        array $usersByGroupParams,
        array $usersByGroupResult,
        int $expectedPersistCount,
        array $expected
    ): void {
        $this->userRepository
            ->method('findBy')
            ->with(['email' => $emails])
            ->willReturn($existentUsersResult)
        ;

        if (!$isNewGroup) {
            $this->userGroupRepository
                ->method('findUsersByGroup')
                ->with($usersByGroupParams['userIds'], $usersByGroupParams['groupId'])
                ->willReturn($usersByGroupResult)
            ;
        } else {
            $this->userGroupRepository
                ->expects($this->never())
                ->method('findUsersByGroup')
            ;
        }

        if (!$dryRun) {
            $this->entityManager
                ->expects($this->exactly($expectedPersistCount))
                ->method('persist')
            ;
        } else {
            $this->entityManager
                ->expects($this->never())
                ->method('persist')
            ;
        }

        $addUsersToGroupFromEmailService = $this->init();

        $actual = $addUsersToGroupFromEmailService->addUsersToGroupFromEmail($emails, $group, $dryRun, $isNewGroup);

        self::assertEquals($expected, $actual);
    }

    public function addUsersToGroupFromEmailProvider(): \Generator
    {
        $group = new Group();
        $group->setId('group1');
        $group->setTitle('Groupe de test');
        $group->setDescription('Groupe de test');

        $alreadyImportedUser = new User();
        $alreadyImportedUser->setId('alreadyImportedUser');
        $alreadyImportedUser->setEmail('alreadyImportedMail@cap-collectif.com');

        $toImportUser = new User();
        $toImportUser->setId('toImportUser');
        $toImportUser->setEmail('toImportMail@cap-collectif.com');

        $userInGroup = new UserGroup();
        $userInGroup->setGroup($group);
        $userInGroup->setUser($alreadyImportedUser);

        yield 'without dryRun' => [
            'emails' => [
                'unexistentMail@cap-collectif.com',
                'alreadyImportedMail@cap-collectif.com',
                'toImportMail@cap-collectif.com',
            ],
            'group' => $group,
            'dryRun' => false,
            'isNewGroup' => false,
            'existentUsersResult' => [$alreadyImportedUser, $toImportUser],
            'usersByGroupParams' => [
                'userIds' => ['alreadyImportedUser', 'toImportUser'],
                'groupId' => $group->getId(),
            ],
            'usersByGroupResult' => [$userInGroup],
            'expectedPersistCount' => 1,
            'expected' => [
                [
                    $toImportUser,
                ],
                [
                    'unexistentMail@cap-collectif.com',
                ],
                [
                    $alreadyImportedUser,
                ],
            ],
        ];

        yield 'with dryRun' => [
            'emails' => [
                'unexistentMail@cap-collectif.com',
                'alreadyImportedMail@cap-collectif.com',
                'toImportMail@cap-collectif.com',
            ],
            'group' => $group,
            'dryRun' => true,
            'isNewGroup' => false,
            'existentUsersResult' => [$alreadyImportedUser, $toImportUser],
            'usersByGroupParams' => [
                'userIds' => ['alreadyImportedUser', 'toImportUser'],
                'groupId' => $group->getId(),
            ],
            'usersByGroupResult' => [$userInGroup],
            'expectedPersistCount' => 1,
            'expected' => [
                [
                    $toImportUser,
                ],
                [
                    'unexistentMail@cap-collectif.com',
                ],
                [
                    $alreadyImportedUser,
                ],
            ],
        ];

        yield 'with a new group' => [
            'emails' => [
                'unexistentMail@cap-collectif.com',
                'alreadyImportedMail@cap-collectif.com',
                'toImportMail@cap-collectif.com',
            ],
            'group' => $group,
            'dryRun' => false,
            'isNewGroup' => true,
            'existentUsersResult' => [$alreadyImportedUser, $toImportUser],
            'usersByGroupParams' => [
                'userIds' => ['alreadyImportedUser', 'toImportUser'],
                'groupId' => $group->getId(),
            ],
            'usersByGroupResult' => [$userInGroup],
            'expectedPersistCount' => 2,
            'expected' => [
                [
                    $alreadyImportedUser,
                    $toImportUser,
                ],
                [
                    'unexistentMail@cap-collectif.com',
                ],
                [],
            ],
        ];
    }

    /**
     * @dataProvider addUsersInGroupFromIdsProvider
     *
     * @param string[] $userIds
     * @param User[]   $expectedNotUsersInGroup
     */
    public function testAddUsersInGroupFromIds(
        array $userIds,
        Group $group,
        array $expectedNotUsersInGroup,
        int $persistCount
    ): void {
        $this->userRepository
            ->expects($this->once())
            ->method('findUsersNotInGroup')
            ->willReturn($expectedNotUsersInGroup)
        ;

        $this->entityManager
            ->expects($this->exactly($persistCount))
            ->method('persist')
        ;

        $groupService = $this->init();

        $actual = $groupService->addUsersInGroupFromIds($userIds, $group);

        self::assertEquals(['group' => $group], $actual);
    }

    public function addUsersInGroupFromIdsProvider(): \Generator
    {
        $group = new Group();
        $group->setId('group1');
        $group->setTitle('Groupe de test');

        yield 'with no user ids' => [
            'userIds' => [],
            'group' => $group,
            'expectedNotUsersInGroup' => [],
            'persistCount' => 0,
        ];

        $user1 = new User();
        $user1->setId('VXNlcjpDaHJpc3RvcGhlQ2Fzc291');

        $user2 = new User();
        $user2->setId('VXNlcjphZG1pbkNhcGNv');

        yield 'with two user ids' => [
            'userIds' => ['VXNlcjpDaHJpc3RvcGhlQ2Fzc291', 'VXNlcjphZG1pbkNhcGNv'],
            'group' => $group,
            'expectedNotUsersInGroup' => [$user1, $user2],
            'persistCount' => 2,
        ];

        yield 'with only one not imported user id' => [
            'userIds' => ['VXNlcjpDaHJpc3RvcGhlQ2Fzc291', 'VXNlcjphZG1pbkNhcGNv'],
            'group' => $group,
            'expectedNotUsersInGroup' => [$user1],
            'persistCount' => 1,
        ];

        yield 'with one invalid user id' => [
            'userIds' => ['invalidUserId', 'VXNlcjphZG1pbkNhcGNv'],
            'group' => $group,
            'expectedNotUsersInGroup' => [$user2],
            'persistCount' => 1,
        ];
    }

    /**
     * @dataProvider deleteUsersInGroupProvider
     *
     * @param string[] $userIds
     * @param User[]   $expectedFindByUsers
     */
    public function testDeleteUsersInGroup(
        array $userIds,
        Group $group,
        int $expectedFindByCount,
        int $expectedRemoveCount,
        array $expectedFindByUsers,
        bool $hasException
    ): void {
        $this->userGroupRepository
            ->expects($this->exactly($expectedFindByCount))
            ->method('findBy')
            ->willReturn($expectedFindByUsers)
        ;

        if (!$hasException) {
            $this->entityManager
                ->expects($this->exactly($expectedRemoveCount))
                ->method('remove')
            ;
        } else {
            $this->expectException(UserError::class);
            $this->expectExceptionMessage('Can\'t delete these users in group.');
        }

        $groupService = $this->init();

        $groupService->deleteUsersInGroup($userIds, $group);
    }

    public function deleteUsersInGroupProvider(): \Generator
    {
        $group = new Group();
        $group->setId('group1');
        $group->setTitle('Groupe de test');

        $user1 = new User();
        $user1->setId('ChristopheCassou');

        $user2 = new User();
        $user2->setId('adminCapco');

        $userGroup1 = new UserGroup();
        $userGroup1->setUser($user1);
        $userGroup1->setGroup($group);

        $userGroup2 = new UserGroup();
        $userGroup2->setUser($user2);
        $userGroup2->setGroup($group);

        yield 'with no user id' => [
            'userIds' => [],
            'group' => $group,
            'expectedFindByCount' => 0,
            'expectedRemoveCount' => 0,
            'expectedFindByUsers' => [],
            'hasException' => false,
        ];

        yield 'with two user ids' => [
            'userIds' => ['VXNlcjpDaHJpc3RvcGhlQ2Fzc291', 'VXNlcjphZG1pbkNhcGNv'],
            'group' => $group,
            'expectedFindByCount' => 1,
            'expectedRemoveCount' => 2,
            'expectedFindByUsers' => [$userGroup1, $userGroup2],
            'hasException' => false,
        ];

        yield 'with one user without group' => [
            'userIds' => ['VXNlcjpDaHJpc3RvcGhlQ2Fzc291', 'VXNlcjphZG1pbkNhcGNv'],
            'group' => $group,
            'expectedFindByCount' => 1,
            'expectedRemoveCount' => 2,
            'expectedFindByUsers' => [$userGroup1],
            'hasException' => true,
        ];
    }

    private function init(): GroupService
    {
        return new GroupService(
            $this->userRepository,
            $this->userGroupRepository,
            $this->entityManager,
            new Logger('test')
        );
    }
}
