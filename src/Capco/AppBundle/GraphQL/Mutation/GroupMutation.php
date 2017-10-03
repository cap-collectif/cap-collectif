<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManager;
use Overblog\GraphQLBundle\Error\UserError;

class GroupMutation
{
    private $om;

    public function __construct(EntityManager $om)
    {
        $this->om = $om;
    }

    public function deleteUserInGroup(string $userId, string $groupId): array
    {
        $userGroup = $this->om->getRepository(UserGroup::class)->findOneBy([
            'user' => $userId,
            'group' => $groupId,
        ]);

        if (!$userGroup) {
            throw new UserError(sprintf('Cannot find the user "%u" in group "%g"', $userId, $groupId));
        }

        $group = $userGroup->getGroup();

        $this->om->remove($userGroup);
        $this->om->flush();

        return ['group' => $group];
    }

    public function addUsersInGroup(array $users, string $groupId): array
    {
        $group = $this->om->getRepository(Group::class)->find($groupId);

        if (!$group) {
            throw new UserError(sprintf('Cannot find the group "%g"', $groupId));
        }

        try {
            foreach ($users as $userId) {
                $user = $this->om->getRepository(User::class)->find($userId);

                if ($user) {
                    $userGroup = $this->om->getRepository(UserGroup::class)->findOneBy([
                        'user' => $user,
                        'group' => $group,
                    ]);

                    if (!$userGroup) {
                        $userGroup = new UserGroup();
                        $userGroup
                            ->setUser($user)
                            ->setGroup($group);

                        $this->om->persist($userGroup);
                    }
                }
            }

            $this->om->flush();

            return ['group' => $group];
        } catch (\Exception $e) {
            throw new UserError(sprintf('Cannot add users in group "%g"', $groupId));
        }
    }
}
