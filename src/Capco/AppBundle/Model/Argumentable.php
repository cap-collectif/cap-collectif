<?php

namespace Capco\AppBundle\Model;

interface Argumentable
{
    public function getArguments();

    public function getArgumentForCount();

    public function getArgumentAgainstCount();
}
