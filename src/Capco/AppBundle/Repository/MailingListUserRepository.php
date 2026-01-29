<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\MailingListUser;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Exception;
use Doctrine\ORM\EntityRepository;

class MailingListUserRepository extends EntityRepository
{
    /**
     * @return array<MailingListUser>
     */
    public function getMailingListUserByUser(User $user): array
    {
        return $this->createQueryBuilder('mlu')
            ->where('mlu.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult()
        ;
    }

    /**
     * @throws Exception
     *
     * @return array<int, array<string, ?string>>
     */
    public function getRecipientDataByMailingList(
        EmailingCampaign $emailingCampaign,
        ?int $limit = 1000
    ): array {
        $userSQL =
            'SELECT
                u.id AS id,
                u.username AS username,
                u.email AS email,
                u.locale AS locale,
                NULL AS token,
                :userType AS type
            FROM mailing_list_user mlu
            INNER JOIN fos_user u ON mlu.user_id = u.id
            LEFT JOIN emailing_campaign_user ecu ON ecu.emailing_campaign_id = :emailingCampaign AND ecu.user_id = u.id
            WHERE mlu.mailing_list_id = :mailingList
              AND u.email IS NOT NULL
              AND u.confirmation_token IS NULL
              AND u.consent_internal_communication = 1
              AND ecu.id IS NULL';

        $participantSQL =
            'SELECT
                p.id AS id,
                p.username AS username,
                p.email AS email,
                p.locale AS locale,
                p.token AS token,
                :participantType AS type
            FROM mailing_list_user mlu
            INNER JOIN participant p ON mlu.participant_id = p.id
            LEFT JOIN emailing_campaign_user ecu ON ecu.emailing_campaign_id = :emailingCampaign AND ecu.participant_id = p.id
            WHERE mlu.mailing_list_id = :mailingList
              AND p.email IS NOT NULL
              AND p.confirmation_token IS NULL
              AND p.consent_internal_communication = 1
              AND ecu.id IS NULL';

        // do NOT use UNION without the ALL, and do NOT add DISTINCT to the SELECT
        // they both remove the duplicates and is too costly in this use case
        // we remove them in PHP
        $sql = 'SELECT id, username, email, locale, token, type
                FROM (' . $userSQL . ' UNION ALL ' . $participantSQL . ' ) AS recipients';
        if (null !== $limit && $limit > 0) {
            $sql .= ' LIMIT ' . $limit;
        }

        return $this->getEntityManager()->getConnection()->fetchAllAssociative($sql, [
            'mailingList' => $emailingCampaign->getMailingList()->getId(),
            'emailingCampaign' => $emailingCampaign->getId(),
            'userType' => RecipientType::User->value,
            'participantType' => RecipientType::Participant->value,
        ]);
    }
}
