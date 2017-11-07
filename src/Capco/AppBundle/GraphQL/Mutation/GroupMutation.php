<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Form\GroupCreateType;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Form\FormFactory;

class GroupMutation
{
    private $om;
    private $formFactory;

    public function __construct(EntityManager $om, FormFactory $formFactory)
    {
        $this->om = $om;
        $this->formFactory = $formFactory;
    }

    public function create(Argument $input): array
    {
        $group = new Group();

        $form = $this->formFactory->create(GroupCreateType::class, $group);

        $form->submit($input->getRawArguments(), false);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
        }

        $this->om->persist($group);
        $this->om->flush();

        return ['group' => $group];
    }

    public function update(Argument $input): array
    {
        $arguments = $input->getRawArguments();
        $group = $this->om->getRepository('CapcoAppBundle:Group')->find($arguments['groupId']);

        if (!$group) {
            throw new UserError(sprintf('Unknown group with id "%d"', $arguments['groupId']));
        }

        unset($arguments['groupId']);

        $form = $this->formFactory->create(GroupCreateType::class, $group);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
        }

        $this->om->flush();

        return ['group' => $group];
    }

    public function delete(string $groupId): array
    {
        $group = $this->om->getRepository(Group::class)->find($groupId);

        if (!$group) {
            throw new UserError(sprintf('Unknown group with id "%s"', $groupId));
        }

        try {
            $this->om->remove($group);
            $this->om->flush();
        } catch (\Exception $e) {
            throw new UserError(sprintf('Unable to delete group with id "%s"', $groupId));
        }

        return ['group' => $group];
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
