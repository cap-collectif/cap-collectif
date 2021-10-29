<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\UserInvite\UserInviteNewInvitation;
use Capco\AppBundle\Mailer\Transport\MailjetTransport;
use Capco\AppBundle\Mailer\Transport\MandrillTransport;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

final class UserInviteNotifier extends BaseNotifier
{
    private Publisher $publisher;
    private EntityManagerInterface $entityManager;
    private LoggerInterface $logger;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        Publisher $publisher,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->publisher = $publisher;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
    }

    public function onNewInvitation(UserInvite $invite): bool
    {
        $recipient = (new User())
            ->setLocale($this->siteParams->getDefaultLocale())
            ->setEmail($invite->getEmail());

        $delivered = $this->mailer->createAndSendMessage(
            UserInviteNewInvitation::class,
            $invite,
            [
                'organizationName' => $this->siteParams->getValue('global.site.organization_name'),
                'invitationMessage' => $invite->getMessage(),
                'invitationUrl' => $this->router->generate(
                    'capco_app_user_invitation',
                    ['token' => $invite->getToken()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
            ],
            $recipient
        );

        // The transport instance returned from the mailer is Capco\AppBundle\Mailer\Transport\Transport
        $transport = $this->mailer->getMailerTransport()->getTransport();
        if ($messageId = $this->getLastMessageId($transport)) {
            if ($transport instanceof MailjetTransport) {
                $invite->setMailjetId($messageId);
            }
            if ($transport instanceof MandrillTransport) {
                $invite->setMandrillId($messageId);
            }

            $this->entityManager->flush();
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::USER_INVITE_CHECK,
                new Message(
                    json_encode([
                        'id' => $invite->getId(),
                        'provider' => \get_class($transport),
                    ])
                )
            );
        }

        return $delivered;
    }

    private function getLastMessageId(\Swift_Transport $transport): ?string
    {
        $transportClass = \get_class($transport);
        if (method_exists($transportClass, 'getLastMessageId')) {
            return $transport->getLastMessageId();
        }
        $this->logger->error(
            "The current transport instance (${transportClass}) does not implement `getLastMessageId` method."
        );

        return null;
    }
}
