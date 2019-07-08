<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface DisplayableInBOInterface
{
    public function viewerCanSeeInBo($user = null): bool;
}
