<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\EmailingCampaign;
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
        ?string $search
    ): array {
        $qb = $this->createQueryBuilder('ec');
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

        return $qb
            ->getQuery()
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getArrayResult();
    }
}
