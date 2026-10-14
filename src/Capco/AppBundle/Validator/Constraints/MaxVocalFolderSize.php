<?php

namespace Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Provider\MediaProvider;
use Symfony\Component\Validator\Constraint;

class MaxVocalFolderSize extends Constraint
{
    public const FOLDER = MediaProvider::PRIVATE_VOICE_MESSAGES_DIRECTORY;

    public string $message = 'global.error.server.form';

    public function validatedBy(): string
    {
        return static::class . 'Validator';
    }
}
