<?php

namespace Capco\AppBundle\Model;

interface ExpirableInterface
{
    public function isExpired();
    public function setExpired($boolean);
}
