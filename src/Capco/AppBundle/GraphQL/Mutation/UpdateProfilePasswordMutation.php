<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ChangePasswordFormType;
use FOS\UserBundle\Model\UserManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;

class UpdateProfilePasswordMutation extends BaseUpdateProfile
{
    private $userManager;

    public function __invoke(Argument $input, User $user): array
    {
        $arguments = $input->getRawArguments();
        $form = $this->formFactory->create(ChangePasswordFormType::class, null, ['csrf_protection' => false]);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . (string) $form->getErrors(true, false));

            return [self::USER => $user, 'error' => 'fos_user.password.not_current'];
        }
        $this->logger->debug(__METHOD__ . ' : ' . (string) $form->isValid());

        $user->setPlainPassword($arguments['new']);
        $this->userManager->updateUser($user);

        return [self::USER => $user];
    }

    public function setUserManager(UserManagerInterface $userManager)
    {
        $this->userManager = $userManager;
    }
}
