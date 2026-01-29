<?php

namespace Capco\AppBundle\Mailer\Enum;

enum EmailingCampaignUserStatus: string
{
    case Sent = 'sent';

    case Error = 'error';
}
