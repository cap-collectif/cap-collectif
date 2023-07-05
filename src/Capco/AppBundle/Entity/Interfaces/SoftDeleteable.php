<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface SoftDeleteable
{
    public function isDeleted(): bool;
}
