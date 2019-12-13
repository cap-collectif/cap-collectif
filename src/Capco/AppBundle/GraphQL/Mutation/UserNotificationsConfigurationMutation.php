<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\UserNotificationsConfigurationType;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UserNotificationsConfigurationMutation implements MutationInterface
{
    private $entityManager;
    private $logger;
    private $formFactory;

    public function __construct(
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        FormFactoryInterface $formFactory
    ) {
        $this->entityManager = $entityManager;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function change(Argument $args, User $user): array
    {
        $userNotificationsConfiguration = $user->getNotificationsConfiguration();
        $form = $this->formFactory->create(
            UserNotificationsConfigurationType::class,
            $userNotificationsConfiguration
        );
        $values = $args->getArrayCopy();
        $form->submit($values);
        if (!$form->isValid()) {
            $this->logger->error(
                \get_class($this) .
                    ' changeUserNotification: ' .
                    (string) $form->getErrors(true, false)
            );

            throw new UserError('Could not update your notification settings.');
        }
        $this->entityManager->flush();

        return ['user' => $userNotificationsConfiguration->getUser()];
    }
}
