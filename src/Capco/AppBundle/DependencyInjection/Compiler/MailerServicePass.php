<?php

namespace Capco\AppBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;

class MailerServicePass implements CompilerPassInterface
{
    /**
     * You can modify the container here before it is dumped to PHP code.
     *
     * @param ContainerBuilder $container
     *
     * @api
     */
    public function process(ContainerBuilder $container)
    {
        $transportDefinition = $container->getDefinition('swiftmailer.mailer.transport.mandrill');
        $transportDefinition->addMethodCall('setApiKey', [$container->getParameter('mandrill_api_key')]);
        $transportDefinition->addMethodCall('setAsync', [false]);

        $container->setAlias('mandrill', 'swiftmailer.mailer.transport.mandrill');

        // Let's use mandrill if we are in production, and not on a custom smtp server
        if ($container->getParameter('kernel.environment') === 'prod' && getenv('SYMFONY_PRODUCTION_SMTP_MAILER') != true) {
            $container->setAlias('mailer', 'swiftmailer.mailer.mandrill')->setPublic(true);
            $container->setAlias('Swift_Mailer', 'swiftmailer.mailer.mandrill')->setPublic(true);
        }
    }
}
