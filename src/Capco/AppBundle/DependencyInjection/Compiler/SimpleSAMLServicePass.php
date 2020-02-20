<?php

namespace Capco\AppBundle\DependencyInjection\Compiler;

use SimpleSAML\Auth\Simple;
use Capco\AppBundle\Helper\EnvHelper;
use Capco\UserBundle\Authenticator\SamlAuthenticator;
use Capco\UserBundle\Security\Core\User\SamlUserProvider;
use Capco\UserBundle\Authenticator\SimplePreAuthenticator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Capco\UserBundle\Security\Http\Logout\Handler\SAMLLogoutHandler;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Capco\UserBundle\Security\Core\User\SimplePreAuthenticatorUserProvider;

class SimpleSAMLServicePass implements CompilerPassInterface
{
    /**
     * You can modify the container here before it is dumped to PHP code.
     *
     *
     * @api
     */
    public function process(ContainerBuilder $container)
    {
        /**
         * If SAML is not enabled which is the case 99% of time,
         * we disable all SAML services.
         */
        if (
            !EnvHelper::get('SYMFONY_LOGIN_SAML_ALLOWED')
        ) {
            $container->removeDefinition(Simple::class);
            $container->removeDefinition(SamlAuthenticator::class);
            $container->removeDefinition(SamlUserProvider::class);
            $container->removeDefinition('simplesamlphp.authenticator');
            $container->removeDefinition('simplesamlphp.logout_handler');
            $container->removeDefinition('simplesamlphp.auth');

            $definitionSimplePreUserProvider = $container->getDefinition(
                SimplePreAuthenticatorUserProvider::class
            );
            $definitionSimplePreUserProvider->setArgument('$samlProvider', null);

            $definitionSimplePreAuthenticator = $container->getDefinition(
                SimplePreAuthenticator::class
            );
            $definitionSimplePreAuthenticator->setArgument('$samlAuthenticator', null);

            $definitionLogoutSuccessHandler = $container->getDefinition(
                SAMLLogoutHandler::class
            );
            $definitionLogoutSuccessHandler->setArgument('$samlClient', null);
        }
    }
}
