<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Capco\AppBundle\Mailer\Model\EmailCampaignRecipient;
use Doctrine\DBAL\Exception as DBALException;
use Doctrine\ORM\EntityRepository;
use Symfony\Component\Uid\Uuid;

class EmailingCampaignUserRepository extends EntityRepository
{
    /**
     * @param EmailCampaignRecipient[] $recipients
     *
     * @throws DBALException
     */
    public function saveFromRecipients(EmailingCampaign $emailingCampaign, array $recipients): void
    {
        $sql = ' INSERT INTO emailing_campaign_user (id, emailing_campaign_id, user_id, participant_id, sent_at, status) VALUES ';

        $valuesSQL = [];
        $uuidParams = [];
        $userIdParams = [];
        $participantIdParams = [];
        $statusParams = [];

        foreach ($recipients as $i => $recipient) {
            $valuesSQL[] = sprintf(' (:uuid_%d, :campaignId, :userId_%d, :participantId_%d, NOW(), :status_%d) ', $i, $i, $i, $i);

            $uuidParams['uuid_' . $i] = Uuid::v4()->__toString();

            $userIdParams['userId_' . $i] = RecipientType::User === $recipient->getType()
                ? $recipient->getId()
                : null;

            $participantIdParams['participantId_' . $i] = RecipientType::User === $recipient->getType()
                ? null
                : $recipient->getId();

            $statusParams['status_' . $i] = $recipient->getStatusToSave()->value;
        }

        $sql .= implode(',', $valuesSQL);
        $this->getEntityManager()->getConnection()->executeQuery($sql, [
            'campaignId' => $emailingCampaign->getId(),
            ...$uuidParams,
            ...$userIdParams,
            ...$participantIdParams,
            ...$statusParams,
        ]);
    }
}
