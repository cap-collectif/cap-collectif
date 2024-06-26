<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Client\CloudflareElasticClient;

class GeoIPReader
{
    private CloudflareElasticClient $cloudflareElasticClient;

    public function __construct(CloudflareElasticClient $cloudflareElasticClient)
    {
        $this->cloudflareElasticClient = $cloudflareElasticClient;
    }

    /**
     * @param string[] $sources
     *
     * @return null|array<string, string>
     */
    public function getGeoIPData(?string $ipAddress, array $sources = ['geoip']): ?array
    {
        if (null === $ipAddress) {
            return null;
        }

        return $this->cloudflareElasticClient->getGeoIpByIpAddress(
            $ipAddress,
            $sources
        );
    }
}
