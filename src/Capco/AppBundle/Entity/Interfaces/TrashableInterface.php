<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface TrashableInterface
{
    public function isTrashed();

    public function getTrashedAt();

    public function getTrashedReason();
}
