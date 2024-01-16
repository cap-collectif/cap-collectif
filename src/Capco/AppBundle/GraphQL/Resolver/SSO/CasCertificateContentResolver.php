<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Helper\SplFileInfo;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CasCertificateContentResolver implements QueryInterface
{
    /**
     * @var SplFileInfo the SplFileInfo service
     */
    protected SplFileInfo $splFileInfo;

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

        throw new \RuntimeException('certificate not found : ' . $configuration->getCasCertificateFile());
    }
}
