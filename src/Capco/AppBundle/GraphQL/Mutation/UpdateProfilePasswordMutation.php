<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ChangePasswordFormType;
use FOS\UserBundle\Form\Model\ChangePassword;
use FOS\UserBundle\Model\UserManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;

class UpdateProfilePasswordMutation extends BaseUpdateProfile
{
    private $userManager;

    public function __invoke(Argument $input, User $user): array
    {
        parent::__invoke($input, $user);

        $form = $this->formFactory->create(
            ChangePasswordFormType::class,
            new ChangePassword(),
            ['csrf_protection' => false]
        );
        $form->submit($this->arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__.' : '.(string)$form->getErrors(true, false));

            return ['user' => $user, 'error' => 'fos_user.password.not_current'];
        }

        $user->setPlainPassword($this->arguments['new']);
        $this->userManager->updateUser($user);

        return ['user' => $user];
    }

    public function setUserManager(UserManagerInterface $userManager)
    {
        $this->userManager = $userManager;
    }
}
