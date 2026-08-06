<?php

declare(strict_types=1);

namespace CapcoTests\UnitTests;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Resolver\HubApiGreenConfigurationResolver;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class HubApiGreenConfigurationResolverTest extends TestCase
{
    public function testItOnlyExposesWhetherTheTokenIsConfigured(): void
    {
        $repository = $this->createConfiguredMock(
            ExternalServiceConfigurationRepository::class,
            [
                'findHubApiGreenToken' => (new ExternalServiceConfiguration())->setValue('secret-token'),
            ]
        );

        self::assertSame(
            ['isConfigured' => true],
            (new HubApiGreenConfigurationResolver($repository))()
        );
    }

    public function testItReportsAnEmptyConfigurationWithoutExposingAValue(): void
    {
        $repository = $this->createConfiguredMock(
            ExternalServiceConfigurationRepository::class,
            [
                'findHubApiGreenToken' => null,
            ]
        );

        self::assertSame(
            ['isConfigured' => false],
            (new HubApiGreenConfigurationResolver($repository))()
        );
    }
}
