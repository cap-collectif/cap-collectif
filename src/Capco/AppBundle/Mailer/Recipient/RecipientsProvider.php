<?php

namespace Capco\AppBundle\Mailer\Recipient;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\SendEmailingCampaignErrorCode;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Capco\AppBundle\Mailer\Exception\MailerLogicException;
use Capco\AppBundle\Mailer\Model\EmailCampaignRecipient;
use Capco\AppBundle\Repository\MailingListUserRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\DBAL\Exception as DBALException;

class RecipientsProvider
{
    public function __construct(
        private readonly ProjectRecipientsFetcher $projectRecipientsFetcher,
        private readonly ContributorsFetcher $contributorsFetcher,
        private readonly UserRepository $userRepository,
        private readonly MailingListUserRepository $mailingListUserRepository,
    ) {
    }

    /**
     * @throws DBALException
     *
     * @return EmailCampaignRecipient[]
     */
    public function getRecipients(
        EmailingCampaign $emailingCampaign,
        ?int $limit = 1000,
    ): array {
        if ($emailingCampaign->getMailingList()) {
            $recipientsData = $this->mailingListUserRepository->getRecipientDataByMailingList(
                emailingCampaign: $emailingCampaign,
                limit: $limit,
            );
        } elseif ($emailingCampaign->getMailingInternal()) {
            $recipientsData = $this->contributorsFetcher->getRecipientDataFromRegistred(
                emailingCampaign: $emailingCampaign,
                limit: $limit
            );
        } elseif ($emailingCampaign->getEmailingGroup()) {
            $recipientsData = $this->userRepository->getRecipientDataByGroup(
                emailingCampaign: $emailingCampaign,
                limit: $limit,
            );
        } elseif ($emailingCampaign->getProject()) {
            $recipientsData = $this->projectRecipientsFetcher->getRecipientsByEmailingCampaign(
                emailingCampaign: $emailingCampaign,
                limit: $limit,
            );
        } else {
            throw new MailerLogicException(SendEmailingCampaignErrorCode::CANNOT_BE_SENT);
        }

        // remove duplicates (keeps last duplicate, but we don't care which one is kept so this the fastest way)
        $uniqueRecipients = [];
        foreach ($recipientsData as $recipientData) {
            $uniqueRecipients[$recipientData['email']] = $recipientData;
        }
        // reindex by integers, safer for array_map
        $uniqueRecipients = array_values($uniqueRecipients);

        return array_map(
            fn ($recipientData) => new EmailCampaignRecipient(
                email: $recipientData['email'],
                type: RecipientType::from($recipientData['type']),
                id: $recipientData['id'] ?? null,
                username: $recipientData['username'] ?? null,
                locale: $recipientData['locale'] ?? null,
                token: $recipientData['token'] ?? null,
            ),
            $uniqueRecipients
        );
    }
}
