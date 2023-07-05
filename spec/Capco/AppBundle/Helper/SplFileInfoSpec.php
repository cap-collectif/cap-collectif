<?php

namespace spec\Capco\AppBundle\Helper;

use Capco\AppBundle\Helper\SplFileInfo;
use PhpSpec\ObjectBehavior;

class SplFileInfoSpec extends ObjectBehavior
{
    public const CERTIFICATE_FILE_FAKE = 'tmpCertFake.crt';
    public const CERTIFICATE_CONTENT_FAKE = '-----BEGIN CERTIFICATE-----
                                      MIIF6zCCA9OgAwIBAgIUe15TY4qN55eAHOcsBQXSz6Nld9cwDQYJKoZIhvcNAQEL
                                      m9spquST2E0RRiKp4DmGoX7oiSpV/VlI5yC6D9b1JQ==
                                      -----END CERTIFICATE-----
                                     ';

    public function it_should_add_file_and_return_splFileInfo(
        SplFileInfo $splFileInfo
    ) {
        $splFileInfo->buildFile(self::CERTIFICATE_FILE_FAKE)->willReturn($splFileInfo);
    }

    public function it_should_get_contents_and_return_contents(
        SplFileInfo $splFileInfo
    ) {
        $splFileInfo->getContents()->willReturn(self::CERTIFICATE_CONTENT_FAKE);
    }
}
