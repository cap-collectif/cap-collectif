<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\UserAccountFormType;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;

class UpdateUserAccountMutation extends BaseUpdateProfile
{
    public function __invoke(Argument $input, User $viewer): array
    {
        $arguments = $input->getRawArguments();
        $user = $viewer;
        if ($viewer->getId() !== $arguments[self::USER_ID]) {
            /** @var User $user */
            $user = $this->userRepository->find($arguments[self::USER_ID]);
        }

        if (!$user) {
            throw new UserError('User not found.');
        }

        if (!$viewer->hasRole(self::ROLE_SUPER_ADMIN) && \in_array(self::ROLE_SUPER_ADMIN, $arguments['roles'], true) && !$user->hasRole(self::ROLE_SUPER_ADMIN)) {
            throw new UserError('You are not able to add super_admin role to a user.');
        }

        //If the viewer is ROLE_ADMIN but update a user with ROLE_SUPER_ADMIN, we have to make sur the user doesn't lose his ROLE_SUPER_ADMIN
        if (
            !$viewer->hasRole(self::ROLE_SUPER_ADMIN) &&
            !\in_array(self::ROLE_SUPER_ADMIN, $arguments['roles'], true)
            && $user->hasRole(self::ROLE_SUPER_ADMIN)
        ) {
            $arguments['roles'][] = self::ROLE_SUPER_ADMIN;
        }

        unset($arguments[self::USER_ID]);

        $form = $this->formFactory->create(UserAccountFormType::class, $user, ['csrf_protection' => false]);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            throw new UserError('Invalid data.');
        }

        $this->em->flush();

        return [self::USER => $user];
    }
}
