<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface AnonymousParticipationInterface
{
    public function getType(): string;

    public function getToken(): ?string;
}
