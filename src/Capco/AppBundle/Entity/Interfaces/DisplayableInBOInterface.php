<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface DisplayableInBOInterface
{
    public function canDisplayInBo($user = null): bool;
}
