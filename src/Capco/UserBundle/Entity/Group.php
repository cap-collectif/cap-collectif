<?php

namespace Capco\UserBundle\Entity;

use FOS\UserBundle\Model\Group as BaseGroup;

class Group extends BaseGroup
{
    public function __toString(): string
    {
        return $this->getName() ?: '';
    }
}
