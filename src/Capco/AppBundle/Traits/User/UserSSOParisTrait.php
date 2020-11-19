<?php

namespace Capco\AppBundle\Traits\User;

trait UserSSOParisTrait
{
    protected ?string $parisId;

    public function setParisId(string $parisId): self
    {
        $this->parisId = $parisId;

        return $this;
    }

    public function getParisId(): ?string
    {
        return $this->parisId;
    }

}
