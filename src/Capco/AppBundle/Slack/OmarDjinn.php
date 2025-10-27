<?php

namespace Capco\AppBundle\Slack;

use Capco\AppBundle\Entity\EmailingCampaign;

class OmarDjinn extends AbstractSlackMessager
{
    public function __construct(
        private readonly ?string $hook,
        private readonly string $instanceName
    ) {
    }

    public function sendBefore(EmailingCampaign $emailingCampaign): void
    {
        $this->send(
            sprintf(
                'La campagne %s sur l\'instance %s doit être lancée à %s, je vous préviendrai dès qu\'elle est terminée.',
                $emailingCampaign->getName(),
                $this->instanceName,
                $emailingCampaign->getSendAt()->format('H:i:s')
            )
        );
    }

    public function sendAfter(int $count): void
    {
        $this->send(
            sprintf('Merci de votre patience ! La campagne a été envoyée à %s destinataires', $count)
        );
    }

    public function sendFail(string $errorMessage): void
    {
        $this->send('Une erreur est survenue ! Une intervention humaine est nécessaire pour débloquer la situation.');
        $this->send($errorMessage);
    }

    protected function getHook(): string
    {
        return 'https://hooks.slack.com/services/' . $this->hook;
    }
}
