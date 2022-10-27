<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\UserBundle\Entity\User;

interface CreatableInterface
{
    public function getCreator(): ?User;

    public function setCreator(User $creator): self;
}
