<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\MapProviderEnum;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\TimestampableTrait;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MapTokenRepository")
 * @ORM\Table(name="map_token")
 */
class MapToken
{
    use UuidTrait;
    use TimestampableTrait;

    /**
     * @ORM\Column(name="base_token", type="string", nullable=false)
     */
    protected $baseToken;

    /**
     * @ORM\Column(name="client_token", type="string", nullable=true)
     */
    protected $clientToken;

    /**
     * @ORM\Column(name="provider", type="string", columnDefinition="ENUM('mapbox')", nullable=false)
     */
    protected $provider = MapProviderEnum::MAPBOX;

    public function getBaseToken(): ?string
    {
        return $this->baseToken;
    }

    public function setBaseToken(string $baseToken): self
    {
        $this->baseToken = $baseToken;

        return $this;
    }

    public function getClientToken(): ?string
    {
        return $this->clientToken;
    }

    public function setClientToken(string $clientToken): self
    {
        $this->clientToken = $clientToken;

        return $this;
    }

    public function getProvider(): ?string
    {
        return $this->provider;
    }

    public function setProvider(string $provider): self
    {
        if (!MapProviderEnum::isProviderValid($provider)) {
            throw new \InvalidArgumentException(
                sprintf(
                    "Invalid provider '%s'. Available providers : %s",
                    $provider,
                    implode(', ', MapProviderEnum::getAvailableProviders())
                )
            );
        }

        $this->provider = $provider;

        return $this;
    }
}
