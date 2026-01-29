<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Capco\AppBundle\Mailer\Model\EmailCampaignRecipient;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Exception as DBALException;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|ActionToken find($id, $lockMode = null, $lockVersion = null)
 * @method null|ActionToken findOneBy(array $criteria, array $orderBy = null)
 * @method ActionToken[]    findAll()
 * @method ActionToken[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ActionTokenRepository extends EntityRepository
{
    public function getUnusedUserActionToken(User $user, string $action): ?ActionToken
    {
        return $this->findOneBy([
            'user' => $user,
            'action' => $action,
            'consumptionDate' => null,
        ]);
    }

    public function getUserActionToken(User $user, string $action): ?ActionToken
    {
        return $this->findOneBy([
            'user' => $user,
            'action' => $action,
        ]);
    }

    /**
     * @param EmailCampaignRecipient[] $users
     *
     * @throws DBALException
     *
     * @return array<int|string, array<string, bool|string>>
     */
    public function getUnsubscribeTokensFromRecipients(array $users): array
    {
        $userParams = [];

        foreach ($users as $i => $user) {
            if (null !== $user->getId() && RecipientType::User === $user->getType()) {
                $userParams['userId_' . $i] = $user->getId();
            }
        }

        if (empty($userParams)) {
            return [];
        }

        $userParamsPlaceholders = implode(',', array_map(fn (string $userParam) => ':' . $userParam, array_keys($userParams)));

        $sql =
            'SELECT user_id, token, IF(consumption_date IS NOT NULL, 1, 0) as reset_date FROM action_token
            WHERE user_id IN (' . $userParamsPlaceholders . ') AND action = :action';

        $queryResult = $this->getEntityManager()->getConnection()->fetchAllAssociative($sql, [
            'action' => ActionToken::UNSUBSCRIBE,
            ...$userParams,
        ]);
        $result = [];

        foreach ($queryResult as $row) {
            $result[$row['user_id']] = [
                'token' => $row['token'],
                'reset_date' => (bool) $row['reset_date'],
            ];
        }

        return $result;
    }

    /**
     * @param EmailCampaignRecipient[] $recipients
     *
     * @throws DBALException
     */
    public function saveNewTokensFromRecipients(array $recipients): void
    {
        $filteredRecipients = array_filter(
            $recipients,
            fn (EmailCampaignRecipient $recipient) => $recipient->isCreateTokenInDatabase()
                && RecipientType::User === $recipient->getType()
                && null !== $recipient->getId(),
        );

        if (empty($filteredRecipients)) {
            return;
        }

        $sql = ' INSERT INTO action_token (token, user_id, action, consumption_date) VALUES ';

        $valuesSQL = [];
        $tokenParams = [];
        $userIdParams = [];

        foreach ($filteredRecipients as $i => $recipient) {
            $valuesSQL[] = sprintf(' (:token_%d, :userId_%d, :action, NULL) ', $i, $i);
            $tokenParams['token_' . $i] = $recipient->getActionToken();
            $userIdParams['userId_' . $i] = $recipient->getId();
        }

        $sql .= implode(',', $valuesSQL);

        $this->getEntityManager()->getConnection()->executeQuery($sql, [
            'action' => ActionToken::UNSUBSCRIBE,
            ...$tokenParams,
            ...$userIdParams,
        ]);
    }

    /**
     * @param EmailCampaignRecipient[] $recipients
     *
     * @throws DBALException
     */
    public function resetConsumptionDateFromRecipients(array $recipients): void
    {
        if (empty($recipients)) {
            return;
        }

        $recipientParams = [];
        foreach ($recipients as $i => $recipient) {
            if (
                null === $recipient->getId()
                || RecipientType::User !== $recipient->getType()
                || !$recipient->isResetConsuptionDate()
            ) {
                continue;
            }

            $recipientParams['recipientId_' . $i] = $recipient->getId();
        }

        if (empty($recipientParams)) {
            return;
        }

        $placeHolders = implode(',', array_map(fn (string $recipientParam) => ':' . $recipientParam, array_keys($recipientParams)));

        $sql =
            ' UPDATE action_token SET consumption_date = NULL
             WHERE user_id IN (' . $placeHolders . ') AND action = :action';

        $this->getEntityManager()->getConnection()->executeQuery($sql, [
            'action' => ActionToken::UNSUBSCRIBE,
            ...$recipientParams,
        ]);
    }
}
