<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Enum\EmailingCampaignAffiliation;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * @method EmailingCampaign|null find($id, $lockMode = null, $lockVersion = null)
 * @method EmailingCampaign|null findOneBy(array $criteria, array $orderBy = null)
 * @method EmailingCampaign[]    findAll()
 * @method EmailingCampaign[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class EmailingCampaignRepository extends EntityRepository
{
    private const ORDERS = [
        'SEND_AT' => 'sendAt',
    ];

    public function search(
        int $offset,
        int $limit,
        ?string $status,
        ?string $orderByField,
        ?string $orderByDirection,
        ?string $search,
        array $affiliations = [],
        ?User $user = null
    ): array {
        $qb = $this->createQueryBuilder('ec');
        $qb->leftJoin('ec.mailingList', 'ml')->select('ec', 'ml');
        if ($status) {
            $qb->where('ec.status = :status')->setParameter('status', $status);
        } else {
            $qb->where('ec.status != :status')->setParameter('status', 'ARCHIVED');
        }
        if ($search) {
            $qb->andWhere('ec.name LIKE :name')->setParameter('name', "%${search}%");
        }
        if ($orderByField && $orderByDirection) {
            $qb->orderBy('ec.' . self::ORDERS[$orderByField], $orderByDirection);
        }
        if (
            $affiliations &&
            \in_array(EmailingCampaignAffiliation::OWNER, $affiliations) &&
            $user
        ) {
            $qb->andWhere('ml.owner = :user')->setParameter('user', $user);
        }

        return $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getResult();
    }

    public function findPlanned(\DateTimeInterface $sendAt): array
    {
        return $this->createQueryBuilder('ec')
            ->where('ec.status = :status')
            ->AndWhere('ec.sendAt < :sendAt')
            ->setParameter('status', EmailingCampaignStatus::PLANNED)
            ->setParameter('sendAt', $sendAt)
            ->getQuery()
            ->getResult();
    }
}
