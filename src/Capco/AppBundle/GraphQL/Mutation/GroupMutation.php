<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Form\GroupCreateType;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

class GroupMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function create(Argument $input): array
    {
        $group = new Group();

        $form = $this->container->get('form.factory')->create(GroupCreateType::class, $group);

        $form->submit($input->getArrayCopy(), false);

        if (!$form->isValid()) {
            $logger = $this->container->get('logger');
            $logger->error(
                \get_class($this) . ' create: ' . (string) $form->getErrors(true, false)
            );

            throw new UserError('Can\'t create this group.');
        }

        $om = $this->container->get('doctrine.orm.entity_manager');

        $om->persist($group);
        $om->flush();

        return ['group' => $group];
    }

    public function update(Argument $input): array
    {
        $arguments = $input->getArrayCopy();
        $group = $this->container->get(GroupRepository::class)->find($arguments['groupId']);

        if (!$group) {
            throw new UserError(sprintf('Unknown group with id "%d"', $arguments['groupId']));
        }

        unset($arguments['groupId']);

        $form = $this->container->get('form.factory')->create(GroupCreateType::class, $group);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $logger = $this->container->get('logger');
            $logger->error(
                \get_class($this) . ' update: ' . (string) $form->getErrors(true, false)
            );

            throw new UserError('Can\'t update this group.');
        }

        $this->container->get('doctrine.orm.entity_manager')->flush();

        return ['group' => $group];
    }

    public function delete(string $groupId): array
    {
        $group = $this->container->get(GroupRepository::class)->find($groupId);

        if (!$group) {
            throw new UserError(sprintf('Unknown group with id "%s"', $groupId));
        }

        try {
            $om = $this->container->get('doctrine.orm.entity_manager');
            $om->remove($group);
            $om->flush();
        } catch (\Exception $e) {
            $logger = $this->container->get('logger');
            $logger->error(\get_class($this) . ' delete: ' . $group->getId());

            throw new UserError('Can\'t delete this group.');
        }

        return ['deletedGroupTitle' => $group->getTitle()];
    }

    public function deleteUserInGroup(string $userId, string $groupId): array
    {
        $userId = GlobalId::fromGlobalId($userId)['id'];
        $userGroup = $this->container->get(UserGroupRepository::class)->findOneBy([
            'user' => $userId,
            'group' => $groupId
        ]);

        if (!$userGroup) {
            $error = sprintf('Cannot find the user "%u" in group "%g"', $userId, $groupId);
            $logger = $this->container->get('logger');
            $logger->error(\get_class($this) . ' deleteUserInGroup: ' . $error);

            throw new UserError('Can\'t delete this user in group.');
        }

        $group = $userGroup->getGroup();

        $om = $this->container->get('doctrine.orm.entity_manager');

        $om->remove($userGroup);
        $om->flush();

        return ['group' => $group];
    }

    public function addUsersInGroup(array $users, string $groupId): array
    {
        /** @var Group $group */
        $group = $this->container->get(GroupRepository::class)->find($groupId);
        $om = $this->container->get('doctrine.orm.entity_manager');
        $logger = $this->container->get('logger');

        if (!$group) {
            $error = sprintf('Cannot find the group "%g"', $groupId);
            $logger->error(\get_class($this) . ' addUsersInGroup: ' . $error);

            throw new UserError('Can\'t add users in group.');
        }

        try {
            foreach ($users as $userId) {
                $userId = GlobalId::fromGlobalId($userId)['id'];
                /** @var User $user */
                $user = $this->container->get(UserRepository::class)->find($userId);

                if ($user) {
                    $userGroup = $this->container->get(UserGroupRepository::class)->findOneBy([
                        'user' => $user,
                        'group' => $group
                    ]);

                    if (!$userGroup) {
                        $userGroup = new UserGroup();
                        $userGroup->setUser($user)->setGroup($group);

                        $om->persist($userGroup);
                    }
                }
            }

            $om->flush();

            return ['group' => $group];
        } catch (\Exception $e) {
            $logger->error(
                \get_class($this) .
                    ' addUsersInGroup: ' .
                    sprintf('Cannot add users in group with id "%g"', $groupId)
            );

            throw new UserError('Can\'t add users in group.');
        }
    }
}
