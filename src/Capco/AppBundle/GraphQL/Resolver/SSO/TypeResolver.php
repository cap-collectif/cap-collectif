<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\AbstractSSOConfiguration;
use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Entity\SSO\FacebookSSOConfiguration;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver as BaseTypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class TypeResolver implements QueryInterface
{
    private readonly BaseTypeResolver $typeResolver;

    public function __construct(BaseTypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractSSOConfiguration $data): Type
    {
        if ($data instanceof Oauth2SSOConfiguration) {
            return $this->typeResolver->resolve('InternalOauth2SSOConfiguration');
        }

        if ($data instanceof FranceConnectSSOConfiguration) {
            return $this->typeResolver->resolve('InternalFranceConnectSSOConfiguration');
        }

        if ($data instanceof FacebookSSOConfiguration) {
            return $this->typeResolver->resolve('InternalFacebookSSOConfiguration');
        }

        if ($data instanceof CASSSOConfiguration) {
            return $this->typeResolver->resolve('InternalCASSSOConfiguration');
        }

        throw new UserError('Could not resolve type of SSO Configuration.');
    }
}
