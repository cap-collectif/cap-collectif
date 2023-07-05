<?php

namespace Capco\AppBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class MailerServicePass implements CompilerPassInterface
{
    /**
     * You can modify the container here before it is dumped to PHP code.
     *
     * @api
     */
    public function process(ContainerBuilder $container)
    {
        // Let's use api mailer (mandrill or mailjet) if we are in production, and not on a custom smtp server
        if (
            'prod' === $container->getParameter('kernel.environment')
            && true != getenv('SYMFONY_PRODUCTION_SMTP_MAILER')
           ) {
            $transportDefinition = $container->getDefinition('swiftmailer.mailer.transport.api');
            $transportDefinition->addMethodCall('setMandrillApiKey', [
                $container->getParameter('mandrill_api_key'),
            ]);
            $transportDefinition->addMethodCall('setMandrillAsync', [false]);
            $transportDefinition->addMethodCall('setMailjetPublicKey', [
                $container->getParameter('mailjet_public_key'),
            ]);
            $transportDefinition->addMethodCall('setMailjetPrivateKey', [
                $container->getParameter('mailjet_private_key'),
            ]);
            $container->setAlias('mailer', 'swiftmailer.mailer.api')->setPublic(true);
            $container->setAlias('Swift_Mailer', 'swiftmailer.mailer.api')->setPublic(true);
        } else {
            $container->setAlias('mailer', 'swiftmailer.mailer.smtp')->setPublic(true);
            $container->setAlias('Swift_Mailer', 'swiftmailer.mailer.smtp')->setPublic(true);
        }
    }
}
