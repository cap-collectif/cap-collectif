<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\Helper\SplFileInfo;

class CasCertificateContentResolver implements ResolverInterface
{
    /**
     * @var SplFileInfo The SplFileInfo service.
     */
    protected SplFileInfo $splFileInfo;

    /**
     * @param SplFileInfo $splFileInfo
     */
    public function __construct(SplFileInfo $splFileInfo)
    {
        $this->splFileInfo = $splFileInfo;
    }

    public function __invoke(CASSSOConfiguration $configuration): string
    {
        $content = $this->splFileInfo->buildFile($configuration->getCasCertificateFile())->getContents();

        if ($content) {
            return $content;
        }

        throw new \RuntimeException(
            'certificate not found : ' . $configuration->getCasCertificateFile()
        );
    }
}
