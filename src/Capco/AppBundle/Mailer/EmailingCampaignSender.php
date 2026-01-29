<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\AbstractUserToken;
use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Mailer\Enum\EmailingCampaignUserStatus;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Capco\AppBundle\Mailer\Exception\MailerExternalServiceException;
use Capco\AppBundle\Mailer\Model\EmailCampaignRecipient;
use Capco\AppBundle\Mailer\Recipient\MessageBuilder;
use Capco\AppBundle\Mailer\Recipient\RecipientsProvider;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClientV2;
use Capco\AppBundle\Repository\ActionTokenRepository;
use Capco\AppBundle\Repository\EmailingCampaignUserRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityManagerInterface;
use Mailjet\Response as MailjetResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Twig\Environment as TemplateEngine;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;

/**
 * This class is responsible for sending emailing campaigns via Mailjet.
 * To be able to process a lot of emails :
 * - We do things in batch instead of just doing it one by one in a loop.
 * - We don't always use entitites to store data.
 */
class EmailingCampaignSender
{
    public function __construct(
        private readonly SiteParameterResolver $siteParams,
        private readonly RouterInterface $router,
        private readonly RecipientsProvider $recipientsProvider,
        private readonly EmailingCampaignUserRepository $emailingCampaignUserRepository,
        private readonly TemplateEngine $templateEngine,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
        private readonly MailjetClientV2 $mailjetClient,
        private readonly ActionTokenRepository $actionTokenRepository,
        private readonly MessageBuilder $messageBuilder,
    ) {
    }

    /**
     * @throws SyntaxError
     * @throws RuntimeError
     * @throws LoaderError
     * @throws Exception
     */
    public function send(EmailingCampaign $emailingCampaign): int
    {
        // Initialisation of everything that does not need to be in the loop to improve performance by doing them only once
        $siteName = $this->siteParams->getValue('global.site.fullname');
        $siteUrl = $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL);
        $htmlPart = $this->buildHtmlPart($emailingCampaign, $siteName, $siteUrl);
        $basePayload = $this->getBasePayload($emailingCampaign);
        // end

        $totalRecipientsProcessed = 0;
        do {
            $recipientsPage = $this->recipientsProvider->getRecipients(
                emailingCampaign: $emailingCampaign,
                limit: MailjetClientV2::MAX_RECIPIENTS,
            );

            $recipientsCount = \count($recipientsPage);
            if (0 === $recipientsCount) {
                break;
            }
            $totalRecipientsProcessed += $recipientsCount;

            $this->enrichRecipientsWithActionTokenInfo($recipientsPage);

            /**
             * In case there is a problem for one recipient, with the try catch we can still send emails to the rest of the current chunk.
             */
            $messages = [];
            foreach ($recipientsPage as $recipientFromPage) {
                try {
                    $messages[] = $this->messageBuilder->buildOneMessage(
                        emailingCampaign: $emailingCampaign,
                        recipientFromPage: $recipientFromPage,
                        htmlPart: $htmlPart,
                        siteName: $siteName,
                        siteUrl: $siteUrl,
                    );

                    $recipientFromPage->setStatusToSave(EmailingCampaignUserStatus::Sent);
                } catch (\Throwable $throwable) {
                    $recipientFromPage->setStatusToSave(EmailingCampaignUserStatus::Error);
                    $this->logger->error(
                        message: sprintf('Unable to process recipient: %s', $throwable->getMessage()),
                        context: [
                            'recipient' => [
                                'id' => $recipientFromPage->getId(),
                                'email' => $recipientFromPage->getEmail(),
                            ],
                            'campaign' => [
                                'id' => $emailingCampaign->getId(),
                                'name' => $emailingCampaign->getName(),
                            ],
                        ]
                    );
                }
            }

            if (empty($messages)) {
                continue;
            }

            try {
                $mailjetResponse = $this->mailjetClient->post([
                    'Messages' => $messages,
                    ...$basePayload,
                ]);

                if (true !== $mailjetResponse->success()) {
                    throw new MailerExternalServiceException('Mailjet API returned an error.');
                }

                $this->processMaijetSuccess($emailingCampaign, $recipientsPage);
            } catch (\Throwable $throwable) {
                $this->processMailjetFailure(
                    emailingCampaign: $emailingCampaign,
                    recipientsPage: $recipientsPage,
                    throwable: $throwable,
                    mailjetResponse: $mailjetResponse ?? null,
                );
            }
        } while (MailjetClientV2::MAX_RECIPIENTS === $recipientsCount);

        $emailingCampaign->setSendAt(new \DateTime());
        $emailingCampaign->setStatus(EmailingCampaignStatus::SENT);
        $this->entityManager->flush();

        return $totalRecipientsProcessed;
    }

    /**
     * @param EmailCampaignRecipient[] $recipients
     *
     * @throws Exception
     */
    private function enrichRecipientsWithActionTokenInfo(array $recipients): void
    {
        $filteredRecipients = array_filter($recipients, fn (EmailCampaignRecipient $recipient) => RecipientType::User === $recipient->getType());

        if (empty($filteredRecipients)) {
            return;
        }

        $actionTokensAvailable = $this->actionTokenRepository->getUnsubscribeTokensFromRecipients($filteredRecipients);

        foreach ($filteredRecipients as $recipient) {
            $recipientHasToken = isset($actionTokensAvailable[$recipient->getId()]);
            if ($recipientHasToken) {
                $recipient->setActionToken($actionTokensAvailable[$recipient->getId()]['token'] ?? null);
                $recipient->setResetConsuptionDate($actionTokensAvailable[$recipient->getId()]['reset_date']);

                continue;
            }
            $recipient->setActionToken(AbstractUserToken::generateToken());
            $recipient->setCreateTokenInDatabase(true);
        }
    }

    /**
     * @throws SyntaxError
     * @throws RuntimeError
     * @throws LoaderError
     */
    private function buildHtmlPart(EmailingCampaign $emailingCampaign, int|string $siteName, string $siteUrl): string
    {
        return $this->templateEngine->render('@CapcoMail/campaignMailjet.html.twig', [
            'content' => $emailingCampaign->getContent(),
            'siteName' => $siteName,
            'baseUrl' => $siteUrl,
        ]);
    }

    // We ignore missingType.iterableValue because the messages structure depends on the MailJet API
    // @phpstan-ignore missingType.iterableValue
    private function getBasePayload(EmailingCampaign $emailingCampaign): array
    {
        return [
            'Globals' => [
                'From' => [
                    'Email' => $emailingCampaign->getSenderEmail(),
                    'Name' => $emailingCampaign->getSenderName(),
                ],
                'Subject' => $emailingCampaign->getObject(),
                'CustomCampaign' => sprintf('%s (%s)', $emailingCampaign->getName(), $emailingCampaign->getId()),
                'DeduplicateCampaign' => true,
            ],
        ];
    }

    /**
     * @param EmailCampaignRecipient[] $recipientsPage
     *
     * @throws Exception
     */
    private function processMaijetSuccess(EmailingCampaign $emailingCampaign, array $recipientsPage): void
    {
        $this->actionTokenRepository->saveNewTokensFromRecipients($recipientsPage);
        $this->actionTokenRepository->resetConsumptionDateFromRecipients($recipientsPage);
        $this->emailingCampaignUserRepository->saveFromRecipients($emailingCampaign, $recipientsPage);
    }

    /**
     * @param EmailCampaignRecipient[] $recipientsPage
     *
     * @throws Exception
     */
    private function processMailjetFailure(
        EmailingCampaign $emailingCampaign,
        array $recipientsPage,
        ?\Throwable $throwable = null,
        ?MailjetResponse $mailjetResponse = null
    ): void {
        $context = [
            'campaign' => [
                'id' => $emailingCampaign->getId(),
                'name' => $emailingCampaign->getName(),
            ],
        ];

        if (null !== $mailjetResponse) {
            $context['mailjetResponse'] = [
                'reasonPhrase' => $mailjetResponse->getReasonPhrase(),
                'status' => $mailjetResponse->getStatus(),
                'body' => $mailjetResponse->getBody(),
            ];
        }

        if (null !== $throwable) {
            $context['exception'] = [
                'message' => $throwable->getMessage(),
                'code' => $throwable->getCode(),
            ];
        }

        $this->logger->error(
            message: 'Error while sending emailing campaign via mailjet.',
            context: $context
        );
        foreach ($recipientsPage as $recipientFromPage) {
            $recipientFromPage->setStatusToSave(EmailingCampaignUserStatus::Error);
        }
        $this->emailingCampaignUserRepository->saveFromRecipients($emailingCampaign, $recipientsPage);
    }
}
