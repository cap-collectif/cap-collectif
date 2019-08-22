<?php

namespace Capco\UserBundle\FranceConnect;

trait FranceConnectUserTrait
{
    protected $franceConnectId;
    protected $franceConnectAccessToken;

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
}
