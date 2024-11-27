<?php

use Rector\Config\RectorConfig;
use Rector\Php81\Rector\Array_\FirstClassCallableRector;
use Rector\Php81\Rector\ClassConst\FinalizePublicClassConstantRector;
use Rector\Set\ValueObject\SetList;

return static function (RectorConfig $rectorConfig): void {
    $rectorConfig->paths([
        'src',
        'tests',
        'spec',
    ]);

    $rectorConfig->skip([
        FinalizePublicClassConstantRector::class => [
            'src/Capco/AppBundle/Mailer/Message/AbstractExternalMessage.php',
            'src/Capco/AppBundle/Enum/CreateEmailingCampaignErrorCode.php',
            'src/Capco/AppBundle/Mailer/Message/Debate/DebateLaunch.php',
            'src/Capco/AppBundle/Mailer/Message/Event/EventReviewApprovedMessage.php',
        ],
        FirstClassCallableRector::class => [
            'src/Capco/AppBundle/Sluggable/SluggableListener.php',
        ],
    ]);

    $rectorConfig->sets([
        SetList::PHP_81,
    ]);
};
