<?php

namespace Capco\AppBundle\DependencyInjection\Compiler;

use Capco\AppBundle\Helper\EnvHelper;
use Capco\UserBundle\Authenticator\SamlAuthenticator;
use Capco\UserBundle\Authenticator\SimplePreAuthenticator;
use Capco\UserBundle\Security\Core\User\SamlUserProvider;
use Capco\UserBundle\Security\Http\Logout\Handler\SAMLLogoutHandler;
use SimpleSAML\Auth\Simple;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class SimpleSAMLServicePass implements CompilerPassInterface
{
    /**
     * You can modify the container here before it is dumped to PHP code.
     *
     * @api
     */
    public function process(ContainerBuilder $container)
    {
        /*
         * If SAML is not enabled which is the case 99% of time,
         * we disable all SAML services.
         */
        if (!EnvHelper::get('SYMFONY_LOGIN_SAML_ALLOWED')) {
            $container->removeDefinition(Simple::class);
            $container->removeDefinition(SamlAuthenticator::class);
            $container->removeDefinition(SamlUserProvider::class);
            $container->removeDefinition('simplesamlphp.authenticator');
            $container->removeDefinition('simplesamlphp.logout_handler');
            $container->removeDefinition('simplesamlphp.auth');

            $definitionSimplePreAuthenticator = $container->getDefinition(
                SimplePreAuthenticator::class
            );
            $definitionSimplePreAuthenticator->setArgument('$samlAuthenticator', null);

            $definitionLogoutSuccessHandler = $container->getDefinition(SAMLLogoutHandler::class);
            $definitionLogoutSuccessHandler->setArgument('$samlClient', null);
        }
    }
}
