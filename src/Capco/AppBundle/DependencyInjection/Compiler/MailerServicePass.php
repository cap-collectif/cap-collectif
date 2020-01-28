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
    }
}
