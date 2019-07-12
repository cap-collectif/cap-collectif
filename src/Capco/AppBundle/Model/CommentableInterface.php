<?php

namespace Capco\AppBundle\Model;

interface CommentableInterface
{
    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     */
    public function canDisplay();

    public function canContribute();

    public function isCommentable(): bool;

    public function acceptNewComments(): bool;
}
