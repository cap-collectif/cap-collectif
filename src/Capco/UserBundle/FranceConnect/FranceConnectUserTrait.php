<?php

namespace Capco\UserBundle\FranceConnect;

trait FranceConnectUserTrait
{
    protected ?string $franceConnectId = null;
    protected ?string $franceConnectAccessToken = null;
    protected ?string $franceConnectIdToken = null;
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

    public function getFranceConnectIdToken(): ?string
    {
        return $this->franceConnectIdToken;
    }

    public function setFranceConnectIdToken(?string $franceConnectIdToken): self
    {
        $this->franceConnectIdToken = $franceConnectIdToken;

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
