<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Entity\Interfaces\TrashableInterface;

interface ModerableInterface extends TrashableInterface
{
    public function getModerationToken(): string;
}
