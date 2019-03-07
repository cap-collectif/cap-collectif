<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\UserNotificationsConfigurationType;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserNotificationsConfigurationMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function change(Argument $args, User $user)
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $logger = $this->container->get('logger');
        $userNotificationsConfiguration = $user->getNotificationsConfiguration();
        $formFactory = $this->container->get('form.factory');
        $form = $formFactory->create(UserNotificationsConfigurationType::class, $userNotificationsConfiguration);
        $values = $args->getRawArguments();
        $form->submit($values);
        if (!$form->isValid()) {
            $logger->error(\get_class($this) . ' changeUserNotification: ' . (string) $form->getErrors(true, false));
            throw new UserError('Could not update your notification settings.');
        }
        $em->flush();

        return ['user' => $userNotificationsConfiguration->getUser()];
    }
}
