<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;

/**
 * @Annotation
 */
class CommentHasAuthor extends Constraint
{
    public $message = 'comment.create.no_author_error';

    public function validatedBy()
    {
        return static::class . 'Validator';
    }

    public function getTargets()
    {
        return self::CLASS_CONSTRAINT;
    }
}
