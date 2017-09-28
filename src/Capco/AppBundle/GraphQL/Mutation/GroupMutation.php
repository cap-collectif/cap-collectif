<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class GroupMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function deleteUserInGroup(string $userId, string $groupId): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $userGroup = $this->container->get('capco.user_group.repository')->findOneBy([
            'user' => $userId,
            'group' => $groupId,
        ]);

        if (!$userGroup) {
            throw new UserError(sprintf('Cannot find the user "%u" in group "%g"', $userId, $groupId));
        }

        $group = $userGroup->getGroup();

        $em->remove($userGroup);
        $em->flush();

        return ['group' => $group];
    }
}
