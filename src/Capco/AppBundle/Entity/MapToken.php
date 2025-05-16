<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\MapProviderEnum;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MapTokenRepository")
 * @ORM\Table(name="map_token")
 */
class MapToken implements EntityInterface
{
    use TimestampableTrait;
    use UuidTrait;
    final public const DEFAULT_STYLE_OWNER = 'mapbox';
    final public const DEFAULT_STYLE_ID = 'streets-v10';

    /**
     * @ORM\Column(name="public_token", type="string", nullable=true)
     */
    protected $publicToken;

    /**
     * @ORM\Column(name="secret_token", type="string", nullable=true)
     */
    protected $secretToken;

    /**
     * Should not be nullable, but was causing issues when differing schemas and was always altering table.
     *
     * @ORM\Column(name="provider", type="string", columnDefinition="ENUM('MAPBOX')", nullable=true)
     */
    protected $provider = MapProviderEnum::MAPBOX;

    /**
     * @ORM\Column(name="style_owner", type="string", nullable=true)
     */
    protected $styleOwner;

    /**
     * @ORM\Column(name="style_id", type="string", nullable=true)
     */
    protected $styleId;

    public function getStyleOwner(): ?string
    {
        return $this->styleOwner ?: self::DEFAULT_STYLE_OWNER;
    }

    public function setStyleOwner(?string $styleOwner): self
    {
        $this->styleOwner = $styleOwner;

        return $this;
    }

    public function getStyleId(): ?string
    {
        return $this->styleId ?: self::DEFAULT_STYLE_ID;
    }

    public function setStyleId(?string $styleId): self
    {
        $this->styleId = $styleId;

        return $this;
    }

    public function getPublicToken(): ?string
    {
        return $this->publicToken;
    }

    public function setPublicToken(?string $publicToken): self
    {
        $this->publicToken = $publicToken;

        return $this;
    }

    public function getSecretToken(): ?string
    {
        return $this->secretToken;
    }

    public function setSecretToken(?string $secretToken): self
    {
        $this->secretToken = $secretToken ? ('' !== $secretToken ? $secretToken : null) : null;

        return $this;
    }

    public function getProvider(): ?string
    {
        return $this->provider;
    }

    public function setProvider(string $provider): self
    {
        if (!MapProviderEnum::isProviderValid($provider)) {
            throw new \InvalidArgumentException(sprintf("Invalid provider '%s'. Available providers : %s", $provider, implode(', ', MapProviderEnum::getAvailableProviders())));
        }

        $this->provider = $provider;

        return $this;
    }
}
