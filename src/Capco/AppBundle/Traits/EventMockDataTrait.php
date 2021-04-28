<?php

namespace Capco\AppBundle\Traits;

trait EventMockDataTrait
{
    public static function mockData()
    {
        return [
            'siteName' => 'capco',
            'eventUrl' => 'https://capco.dev/event/event-avec-un-titre-super-long',
            'eventURLExcerpt' => 'https://eventlink.com...',
            'siteUrl' => 'https://capco.dev',
            'baseUrl' => 'https://capco.dev',
            'user_locale' => 'fr-FR',
            'eventStatus' => 'refused',
            'eventTitle' => 'blablbnla',
            'username' => 'Jean',
            'eventComment' =>
                'Votre évènement est en attente de correction de votre part. La date n’est pas conforme, veuillez en indiquer une autre.',
            'eventRefusedReason' => 'Contenu erroné',
            'comment' =>
                'pas bien du tqsb qsjbd ojqshdqsod j iodsjm qhgqomhdgqjfgo rhqeo \n sqiodjqspdjqjdbfjsdfhzuofhz',
            'adminEmail' => 'admin@test.com',
            'color' => '#dc3445',
        ];
    }
}
