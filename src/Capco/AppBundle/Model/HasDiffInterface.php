<?php

namespace Capco\AppBundle\Model;

interface HasDiffInterface
{
    public function getDiff();

    public function setDiff($diff);
}
