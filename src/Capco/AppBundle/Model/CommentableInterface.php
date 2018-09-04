<?php

namespace Capco\AppBundle\Model;

interface CommentableInterface
{
    public function canDisplay();

    public function canContribute();

    public function isCommentable(): bool;

    public function acceptNewComments(): bool;
}
