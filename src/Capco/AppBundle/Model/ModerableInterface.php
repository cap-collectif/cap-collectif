<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Entity\Interfaces\Trashable;

interface ModerableInterface extends Trashable
{
    public function getModerationToken(): string;
}
