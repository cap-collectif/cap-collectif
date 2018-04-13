<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ChangePasswordFormType;
use FOS\UserBundle\Form\Model\ChangePassword;
use FOS\UserBundle\Model\UserManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

class UpdateProfilePasswordMutation
{
    private $userManager;
    private $formFactory;
    private $logger;

    public function __construct(FormFactory $formFactory, UserManagerInterface $userManager, LoggerInterface $logger)
    {
        $this->formFactory = $formFactory;
        $this->userManager = $userManager;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $arguments = $input->getRawArguments();
        $form = $this->formFactory->create(ChangePasswordFormType::class, new ChangePassword(), ['csrf_protection' => false]);
        $form->submit($arguments, false);
        if (!$form->isValid()) {
            $this->logger->error(__METHOD__.' : '.(string)$form->getErrors(true, false));
            throw new \RuntimeException($form->getErrors(true, true));
        }

        $user->setPlainPassword($arguments['new']);
        $this->userManager->updateUser($user);

        return ['viewer' => $user];
    }
}
