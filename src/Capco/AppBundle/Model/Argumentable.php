<?php

namespace Capco\AppBundle\Model;

interface Argumentable
{
    public function getArguments();

    public function getArgumentForCount();

    public function getArgumentAgainstCount();

    public function canContribute($user = null);

    public function getOpinionType();

    public function increaseArgumentsCount();

    public function getStep();
}
