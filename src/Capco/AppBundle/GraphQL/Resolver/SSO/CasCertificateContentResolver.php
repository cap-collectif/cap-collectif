<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class CasCertificateContentResolver implements ResolverInterface
{
    public function __invoke(CASSSOConfiguration $configuration): string
    {
        $content = file_get_contents($configuration->getCasCertificateFile());
        if ($content) {
            return $content;
        }

        throw new \RuntimeException(
            'certificate not found : ' . $configuration->getCasCertificateFile()
        );
    }
}
