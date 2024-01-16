<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\UserAccountFormType;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class UpdateUserAccountMutation extends BaseUpdateProfile
{
    use MutationTrait;

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $arguments = $input->getArrayCopy();
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
            !$viewer->hasRole(self::ROLE_SUPER_ADMIN)
            && \in_array(self::ROLE_SUPER_ADMIN, $arguments['roles'], true)
            && !$user->hasRole(self::ROLE_SUPER_ADMIN)
        ) {
            throw new UserError('You are not able to add super_admin role to a user.');
        }

        // If the viewer is ROLE_ADMIN but update a user with ROLE_SUPER_ADMIN
        // we have to make sure the user doesn't lose his ROLE_SUPER_ADMIN
        if (
            !$viewer->hasRole(self::ROLE_SUPER_ADMIN)
            && !\in_array(self::ROLE_SUPER_ADMIN, $arguments['roles'], true)
            && $user->hasRole(self::ROLE_SUPER_ADMIN)
        ) {
            $arguments['roles'][] = self::ROLE_SUPER_ADMIN;
        }

        $form = $this->formFactory->create(UserAccountFormType::class, $user, [
            'csrf_protection' => false,
            'isAdmin' => $user->isAdmin(),
        ]);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            throw new GraphQLException($form);
        }

        $this->em->flush();

        return [self::USER => $user];
    }
}
