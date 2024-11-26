<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\GraphQL\Resolver\SSO\CasCertificateContentResolver;
use Capco\AppBundle\Helper\SplFileInfo;
use PhpSpec\ObjectBehavior;

class CasCertificateContentResolverSpec extends ObjectBehavior
{
    final public const CERTIFICATE_FILE_FAKE = 'tmpCertFake.crt';
    final public const CERTIFICATE_CONTENT_FAKE = '-----BEGIN CERTIFICATE-----
                                      MIIF6zCCA9OgAwIBAgIUe15TY4qN55eAHOcsBQXSz6Nld9cwDQYJKoZIhvcNAQEL
                                      m9spquST2E0RRiKp4DmGoX7oiSpV/VlI5yC6D9b1JQ==
                                      -----END CERTIFICATE-----
                                     ';

    public function let(
        SplFileInfo $splFileInfo
    ) {
        $this->beConstructedWith($splFileInfo);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CasCertificateContentResolver::class);
    }

    public function it_should_invoke_and_return_content(
        CASSSOConfiguration $casSSOConfiguration,
        SplFileInfo $splFileInfo
    ) {
        $casSSOConfiguration
            ->getCasCertificateFile()
            ->shouldBeCalled()
            ->willReturn(self::CERTIFICATE_FILE_FAKE)
        ;

        $splFileInfo->buildFile(self::CERTIFICATE_FILE_FAKE)->willReturn($splFileInfo);
        $splFileInfo->getContents()->willReturn(self::CERTIFICATE_CONTENT_FAKE);

        $this->__invoke($casSSOConfiguration, $splFileInfo)->shouldReturn(
            self::CERTIFICATE_CONTENT_FAKE
        );
    }

    public function it_should_invoke_and_throw_exception(
        CASSSOConfiguration $casSSOConfiguration,
        SplFileInfo $splFileInfo
    ) {
        $casSSOConfiguration
            ->getCasCertificateFile()
            ->shouldBeCalled()
            ->willReturn(self::CERTIFICATE_FILE_FAKE)
        ;

        $splFileInfo->buildFile(self::CERTIFICATE_FILE_FAKE)->willReturn($splFileInfo);
        $splFileInfo->getContents()->willReturn('');

        $this->shouldThrow(new \RuntimeException(
            'certificate not found : ' . self::CERTIFICATE_FILE_FAKE
        ))->during('__invoke', [
            $casSSOConfiguration, $splFileInfo,
        ]);
    }
}
