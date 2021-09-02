<?php

namespace Capco\AppBundle\Traits\User;

trait UserSSOOpenIdTrait
{
    protected ?string $openId;
    protected ?string $openIdAccessToken;

    public function setOpenId(?string $openId): self
    {
        $this->openId = $openId;

        return $this;
    }

    public function getOpenId(): ?string
    {
        return $this->openId;
    }

    public function setOpenIdAccessToken(?string $accessToken = null): self
    {
        $this->openIdAccessToken = $accessToken;

        return $this;
    }

    public function getOpenIdAccessToken(): ?string
    {
        return $this->openIdAccessToken;
    }

    public function isOpenidAccount(): bool
    {
        return null !== $this->openId;
    }
}
