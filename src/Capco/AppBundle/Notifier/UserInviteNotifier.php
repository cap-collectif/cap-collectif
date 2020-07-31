<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Mailer\Message\UserInvite\UserInviteNewInvitation;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

final class UserInviteNotifier extends BaseNotifier
{
    public function onNewInvitation(UserInvite $invite): bool
    {
        $recipient = (new User())
            ->setLocale($this->siteParams->getDefaultLocale())
            ->setEmail($invite->getEmail());

        return $this->mailer->createAndSendMessage(
            UserInviteNewInvitation::class,
            $invite,
            [
                'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
                'invitationUrl' => $this->router->generate(
                    'capco_app_user_invitation',
                    ['token' => $invite->getToken()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
            ],
            $recipient
        );
    }
}
