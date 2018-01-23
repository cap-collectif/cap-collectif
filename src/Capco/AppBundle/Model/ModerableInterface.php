<?php

namespace Capco\AppBundle\Model;

interface ModerableInterface
{
    public function getModerationToken(): string;
}
