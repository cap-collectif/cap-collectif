<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\DBAL\Enum\MailerType;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Exception\UserInviteMessageQueuedException;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\UserInvite\UserInviteNewInvitation;
use Capco\AppBundle\Mailer\Message\UserInvite\UserInviteNewInvitationByOrganization;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClient;
use Capco\AppBundle\Mailer\SenderEmailDomains\MandrillClient;
use Capco\AppBundle\Mailer\Transport\MailjetTransport;
use Capco\AppBundle\Mailer\Transport\MandrillTransport;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

final class UserInviteEmailMessageNotifier extends BaseNotifier
{
    private Publisher $publisher;
    private EntityManagerInterface $entityManager;
    private LoggerInterface $logger;
    private MailjetClient $mailjetClient;
    private MandrillClient $mandrillClient;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        Publisher $publisher,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        MailjetClient $mailjetClient,
        MandrillClient $mandrillClient
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->publisher = $publisher;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
        $this->mailjetClient = $mailjetClient;
        $this->mandrillClient = $mandrillClient;
    }

    public function onStatusCheckInvitation(
        UserInviteEmailMessage $emailMessage,
        string $providerClass
    ): bool {
        $inviteStatus = null;
        if (
            MailjetTransport::class === $providerClass &&
            ($inviteMailjetId = $emailMessage->getMailerId())
        ) {
            $response = $this->mailjetClient->get('message/' . $inviteMailjetId);
            $responseBody = json_decode($response->getBody()->getContents(), true);
            $messageStatus = $responseBody['Data'][0]['Status'];
            if (MailjetClient::STATUS_QUEUED === $messageStatus) {
                throw new UserInviteMessageQueuedException(
                    UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
                );
            }

            $inviteStatus = \in_array(
                $messageStatus,
                [
                    MailjetClient::STATUS_SENT,
                    MailjetClient::STATUS_OPENED,
                    MailjetClient::STATUS_CLICKED,
                ],
                true
            )
                ? UserInviteEmailMessage::SENT
                : UserInviteEmailMessage::SEND_FAILURE;
            $emailMessage->setInternalStatus($inviteStatus);
            $this->logger->info(
                '[USER-INVITE] invitation with id ' .
                    $emailMessage->getId() .
                    ' got status : ' .
                    $inviteStatus
            );
        }

        if (
            MandrillTransport::class === $providerClass &&
            ($inviteMandrillId = $emailMessage->getMailerId())
        ) {
            $response = $this->mandrillClient->post('messages/info', ['id' => $inviteMandrillId]);
            $messageStatus = json_decode($response->getBody()->getContents(), true)['state'];
            if (MandrillClient::STATUS_QUEUED === $messageStatus) {
                throw new UserInviteMessageQueuedException(
                    UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
                );
            }

            $inviteStatus =
                MandrillClient::STATUS_SENT === $messageStatus
                    ? UserInviteEmailMessage::SENT
                    : UserInviteEmailMessage::SEND_FAILURE;
            $emailMessage->setInternalStatus($inviteStatus);
            $this->logger->info(
                '[USER-INVITE] invitation with id ' .
                    $emailMessage->getId() .
                    ' got status : ' .
                    $inviteStatus
            );
        }

        $this->entityManager->flush();

        return $inviteStatus && UserInviteEmailMessage::SEND_FAILURE === $inviteStatus;
    }

    public function onNewInvitation(UserInviteEmailMessage $emailMessage): bool
    {
        $invite = $emailMessage->getInvitation();
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

        return $this->deliver($emailMessage, $delivered);
    }

    public function onNewInvitationByOrganization(UserInviteEmailMessage $emailMessage): bool
    {
        $invite = $emailMessage->getInvitation();
        $recipient = (new User())
            ->setLocale($this->siteParams->getDefaultLocale())
            ->setEmail($invite->getEmail());
        $delivered = $this->mailer->createAndSendMessage(
            UserInviteNewInvitationByOrganization::class,
            $invite,
            [
                'platformName' => $this->siteParams->getValue('global.site.organization_name'),
                'organizationName' => $invite->getOrganization()->getTitle(),
                'invitationUrl' => $this->router->generate(
                    'capco_app_user_invitation',
                    ['token' => $invite->getToken()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                ),
            ],
            $recipient
        );

        return $this->deliver($emailMessage, $delivered);
    }

    public function deliver(UserInviteEmailMessage $emailMessage, bool $delivered): bool
    {
        // The transport instance returned from the mailer is Capco\AppBundle\Mailer\Transport\Transport
        $transport = $this->mailer->getMailerTransport()->getTransport();
        if ($messageId = $this->getLastMessageId($transport)) {
            $emailMessage->setMailerId($messageId);
            if ($transport instanceof MailjetTransport) {
                $emailMessage->setMailerType(MailerType::MAILJET);
            }
            if ($transport instanceof MandrillTransport) {
                $emailMessage->setMailerType(MailerType::MANDRILL);
            }

            $this->entityManager->flush();
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::USER_INVITE_CHECK,
                new Message(
                    json_encode([
                        'id' => $emailMessage->getId(),
                        'provider' => ClassUtils::getClass($transport),
                    ])
                )
            );

            return $delivered;
        }

        $emailMessage
            ->setMailerType(MailerType::SMTP)
            ->setInternalStatus(UserInviteEmailMessage::SENT);
        $this->entityManager->flush();

        return $delivered;
    }

    private function getLastMessageId(\Swift_Transport $transport): ?string
    {
        $transportClass = ClassUtils::getClass($transport);
        if (method_exists($transportClass, 'getLastMessageId')) {
            return $transport->getLastMessageId();
        }
        $this->logger->error(
            "The current transport instance (${transportClass}) does not implement `getLastMessageId` method."
        );

        return null;
    }
}
