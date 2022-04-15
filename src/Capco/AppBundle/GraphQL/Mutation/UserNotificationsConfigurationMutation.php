<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Form\UserNotificationsConfigurationType;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UserNotificationsConfigurationMutation implements MutationInterface
{
    private EntityManagerInterface $entityManager;
    private LoggerInterface $logger;
    private FormFactoryInterface $formFactory;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        FormFactoryInterface $formFactory,
        Publisher $publisher
    ) {
        $this->entityManager = $entityManager;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $args, User $user): array
    {
        $userNotificationsConfiguration = $user->getNotificationsConfiguration();
        $wasConsentingInternalComm = $userNotificationsConfiguration->isConsentInternalCommunication();
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

        if (true === $values['consentInternalCommunication'] && !$wasConsentingInternalComm && $user->isEmailConfirmed()) {
            $this->pushToSendinblue('addEmailToSendinblue', ['user' => $user->getEmail()]);
        } elseif (false === $values['consentInternalCommunication'] && $wasConsentingInternalComm && $user->isEmailConfirmed()) {
            $this->pushToSendinblue('blackListUser', ['email' => $user->getEmail()]);
        }

        $this->entityManager->flush();

        return ['user' => $userNotificationsConfiguration->getUser()];
    }

    private function pushToSendinblue(string $method, array $args): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message(
                json_encode([
                    'method' => $method,
                    'args' => $args,
                ])
            )
        );
    }
}
