<?php

namespace Capco\AppBundle\Mailer\Enum;

enum RecipientType: string
{
    case User = 'user';

    case Participant = 'participant';
}
