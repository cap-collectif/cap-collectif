<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface SluggableInterface
{
    public function getSlug(): ?string;
}
