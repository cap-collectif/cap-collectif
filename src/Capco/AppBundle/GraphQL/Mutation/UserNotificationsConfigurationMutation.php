<?php
/**
 * Created by IntelliJ IDEA.
 * User: jbaraomar
 * Date: 31/10/2017
 * Time: 09:53.
 */

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

    public function change(Argument $args, $user)
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        echo $user;
        die();
//        $userNotificationsConfiguration = $this->container->get('capco.user_notifications_configuration.repository')->find([$args['id']]);
//        $formFactory = $this->container->get('form.factory');
//        $form = $formFactory->create(UserNotificationsConfigurationType::class, $userNotificationsConfiguration);
//        $values = $args->getRawArguments();
//        $form->submit($values);
//        if (!$form->isValid()) {
//            throw new UserError('Input not valid.');
//        }
//        $em->flush();
//        return compact('userNotificationsConfiguration');
    }
}
