<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface Owner
{
    public function getId(): ?string;

    public function getUsername(): ?string;
}
