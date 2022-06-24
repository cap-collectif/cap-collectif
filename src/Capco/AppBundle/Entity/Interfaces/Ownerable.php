<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface Ownerable
{
    public function getOwner(): ?Owner;

    public function setOwner(?Owner $owner): self;
}
