<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;

class GroupService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserGroupRepository $userGroupRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * @param string[] $emails
     *
     * @return array{User[], string[], User[]}
     */
    public function addUsersToGroupFromEmail(array $emails, Group $group, bool $dryRun = false, bool $isNewGroup = false): array
    {
        if ([] === $emails) {
            return [[], [], []];
        }

        $emails = array_unique($emails);

        $users = $this->userRepository->findBy(['email' => $emails]);

        $userEmails = array_map(fn ($user) => $user->getEmail(), $users);
        $userIds = array_map(fn ($user) => $user->getId(), $users);

        $notFoundEmails = array_values(array_diff($emails, $userEmails));

        $alreadyImportedUsersByIds = [];
        $alreadyImportedUsers = [];

        if (!$isNewGroup) {
            foreach ($this->userGroupRepository->findUsersByGroup($userIds, $group->getId()) as $alreadyImportedUser) {
                $alreadyImportedUsersByIds[$alreadyImportedUser->getUser()->getId()] = $alreadyImportedUser->getUser();
                $alreadyImportedUsers[] = $alreadyImportedUser->getUser();
            }
        }

        $importedUsers = [];

        foreach ($users as $user) {
            if (\array_key_exists($user->getId(), $alreadyImportedUsersByIds)) {
                continue;
            }

            if (!$dryRun) {
                $userGroup = new UserGroup();
                $userGroup->setUser($user)->setGroup($group);

                $this->entityManager->persist($userGroup);
            }

            $importedUsers[] = $user;
        }

        return [
            $importedUsers,
            $notFoundEmails,
            $alreadyImportedUsers,
        ];
    }

    /**
     * @param string[] $users
     *
     * @return Group[]
     */
    public function addUsersInGroupFromIds(array $users, Group $group): array
    {
        $userIds = array_filter(array_map(fn (string $userId) => GlobalId::fromGlobalId($userId)['id'] ?? null, $users));

        $usersWithoutGroup = $this->userRepository->findUsersNotInGroup($userIds, $group->getId());

        try {
            foreach ($usersWithoutGroup as $user) {
                $userGroup = new UserGroup();
                $userGroup->setUser($user)->setGroup($group);

                $this->entityManager->persist($userGroup);
            }

            return ['group' => $group];
        } catch (\Exception $e) {
            $this->logger->error(
                __METHOD__ .
                ' addUsersInGroup: ' .
                sprintf(
                    'Cannot add users in group with id "%g. Cause : %s"',
                    $group->getId(),
                    $e->getMessage()
                )
            );

            throw new UserError('Can\'t add users in group.');
        }
    }

    /**
     * @param string[] $userIds
     */
    public function deleteUsersInGroup(array $userIds, Group $group): void
    {
        if ([] === $userIds) {
            return;
        }

        $userIds = array_filter(array_map(fn (string $userId) => GlobalId::fromGlobalId($userId)['id'] ?? null, $userIds));

        /** @var UserGroup[] $usersInGroup */
        $usersInGroup = $this->userGroupRepository->findBy([
            'user' => $userIds,
            'group' => $group->getId(),
        ]);

        $notUserInGroupIds = array_filter($userIds, function ($userId) use ($usersInGroup) {
            $userInGroupIds = array_map(fn (UserGroup $userGroup) => $userGroup->getUser()->getId(), $usersInGroup);

            return !\in_array($userId, $userInGroupIds);
        });

        if ([] !== $notUserInGroupIds) {
            $error = sprintf('Cannot find the users "%u" in group "%g"', implode(',', $notUserInGroupIds), $group->getId());

            $this->logger->error(__METHOD__ . ' deleteUserInGroup: ' . $error);

            throw new UserError('Can\'t delete these users in group.');
        }

        foreach ($usersInGroup as $userGroup) {
            $this->entityManager->remove($userGroup);
        }
    }
}
