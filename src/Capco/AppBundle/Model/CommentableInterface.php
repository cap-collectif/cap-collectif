<?php

namespace Capco\AppBundle\Model;

interface CommentableInterface
{
    public function getClassName();

    public function canDisplay();

    public function canContribute();
}
