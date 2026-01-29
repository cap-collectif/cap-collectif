<?php

namespace Capco\AppBundle\Mailer\Recipient;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Doctrine\DBAL\Exception as DBALException;
use Doctrine\ORM\EntityManagerInterface;

class ContributorsFetcher
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    /**
     * @throws DBALException
     *
     * @return array<int, array<string, ?string>>
     */
    public function getRecipientDataFromRegistred(EmailingCampaign $emailingCampaign, ?int $limit = 1000): array
    {
        $userSql =
            'SELECT
                u.id as id,
                u.username as username,
                u.locale as locale,
                u.email as email,
                null as token,
                :userType as type
            FROM fos_user u
            LEFT JOIN emailing_campaign_user ecu ON ecu.emailing_campaign_id = :emailingCampaign AND ecu.user_id = u.id
            WHERE u.email IS NOT NULL
            AND u.consent_internal_communication = 1
            AND u.confirmation_token IS NULL
            AND ecu.id IS NULL';

        $participantSql =
            'SELECT
                p.id as id,
                p.username as username,
                p.locale as locale,
                p.email as email,
                p.token as token,
                :participantType as type
            FROM participant p
            LEFT JOIN emailing_campaign_user ecu ON ecu.emailing_campaign_id = :emailingCampaign AND ecu.participant_id = p.id
            WHERE p.email IS NOT NULL
            AND p.confirmation_token IS NULL
            AND p.consent_internal_communication = 1
            AND ecu.id IS NULL';

        // do NOT use UNION without the ALL, and do NOT add DISTINCT to the SELECT
        // they both remove the duplicates and is too costly in this use case
        // we remove them in PHP
        $sql =
            'SELECT id, username, email, locale, token, type
            FROM ( ' . $userSql . ' UNION ALL ' . $participantSql . ' ) AS recipients';

        if (null !== $limit && $limit > 0) {
            $sql .= ' LIMIT ' . $limit;
        }

        return $this->em->getConnection()->fetchAllAssociative($sql, [
            'userType' => RecipientType::User->value,
            'participantType' => RecipientType::Participant->value,
            'emailingCampaign' => $emailingCampaign->getId(),
        ]);
    }
}
