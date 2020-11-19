<?php

namespace Capco\UserBundle\FranceConnect;

trait FranceConnectUserTrait
{
    protected ?string $franceConnectId;
    protected ?string $franceConnectAccessToken;
    protected bool $isFranceConnectAccount = false;

    public function setFranceConnectId(?string $franceConnectId = null): self
    {
        $this->franceConnectId = $franceConnectId;

        return $this;
    }

    public function getFranceConnectId(): ?string
    {
        return $this->franceConnectId;
    }

    public function setFranceConnectAccessToken(?string $accessToken = null): self
    {
        $this->franceConnectAccessToken = $accessToken;

        return $this;
    }

    public function getFranceConnectAccessToken(): ?string
    {
        return $this->franceConnectAccessToken;
    }

    public function isFranceConnectAccount(): bool
    {
        return null !== $this->franceConnectAccessToken;
    }
}
