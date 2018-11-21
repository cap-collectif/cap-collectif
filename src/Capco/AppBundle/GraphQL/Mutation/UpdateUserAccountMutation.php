<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use GraphQL\Error\UserError;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\UserBundle\Form\Type\UserAccountFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;

class UpdateUserAccountMutation extends BaseUpdateProfile
{
    public function __invoke(Argument $input, User $viewer): array
    {
        $arguments = $input->getRawArguments();
        $user = $viewer;

        if ($viewer->isAdmin() && isset($arguments[self::USER_ID])) {
            $userId = GlobalId::fromGlobalId($arguments[self::USER_ID])['id'];
            /** @var User $user */
            $user = $this->userRepository->find($userId);
        }
        unset($arguments[self::USER_ID]);

        if (!$user) {
            throw new UserError('User not found.');
        }

        if (
            !$viewer->hasRole(self::ROLE_SUPER_ADMIN) &&
            \in_array(self::ROLE_SUPER_ADMIN, $arguments['roles'], true) &&
            !$user->hasRole(self::ROLE_SUPER_ADMIN)
        ) {
            throw new UserError('You are not able to add super_admin role to a user.');
        }

        // If the viewer is ROLE_ADMIN but update a user with ROLE_SUPER_ADMIN
        // we have to make sure the user doesn't lose his ROLE_SUPER_ADMIN
        if (
            !$viewer->hasRole(self::ROLE_SUPER_ADMIN) &&
            !\in_array(self::ROLE_SUPER_ADMIN, $arguments['roles'], true) &&
            $user->hasRole(self::ROLE_SUPER_ADMIN)
        ) {
            $arguments['roles'][] = self::ROLE_SUPER_ADMIN;
        }

        $form = $this->formFactory->create(UserAccountFormType::class, $user, [
            'csrf_protection' => false,
        ]);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            throw new GraphQLException($form);
        }

        $this->em->flush();

        return [self::USER => $user];
    }
}
