<?php

namespace Capco\AppBundle\Repository;

interface PositionableRepository
{
    public function getAllOrderedByPosition();
    public function getEnabledOrderedByPosition();
}
