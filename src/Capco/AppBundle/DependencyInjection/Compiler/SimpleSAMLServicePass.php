<?php

namespace Capco\AppBundle\DependencyInjection\Compiler;

use Capco\AppBundle\Helper\EnvHelper;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class SimpleSAMLServicePass implements CompilerPassInterface
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
        if ($container->hasDefinition('simplesamlphp.auth') && !EnvHelper::get('SYMFONY_LOGIN_SAML_ALLOWED')) {
            $container->removeDefinition('simplesamlphp.authenticator');
            $container->removeDefinition('simplesamlphp.logout_handler');
            $container->removeDefinition('simplesamlphp.auth');
        }
    }
}
