<?php

namespace Capco\AppBundle\Entity\Interfaces\DateTime;

interface Expirable
{
    public const EXPIRES_AT_PERIOD = '+ 7 days';

    public function setExpiresAt(\DateTimeInterface $expiresAt): self;

    public function getExpiresAt(): \DateTimeInterface;

    public function hasExpired(): bool;
}
