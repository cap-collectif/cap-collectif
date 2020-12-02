<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\OfficialResponse;
use Capco\AppBundle\Entity\Proposal;
use Doctrine\ORM\EntityRepository;

/**
 * @method OfficialResponse|null find($id, $lockMode = null, $lockVersion = null)
 * @method OfficialResponse|null findOneBy(array $criteria, array $orderBy = null)
 * @method OfficialResponse[]    findAll()
 * @method OfficialResponse[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OfficialResponseRepository extends EntityRepository
{
    public function getByProposal(Proposal $proposal, bool $onlyPublished = true): ?OfficialResponse
    {
        $filters = [
            'proposal' => $proposal,
        ];
        if ($onlyPublished) {
            $filters['isPublished'] = true;
        }

        return $this->findOneBy($filters);
    }

    public function findPlanned(\DateTimeInterface $publishedAt): array
    {
        return $this->createQueryBuilder('response')
            ->where('response.isPublished = 0')
            ->AndWhere('response.publishedAt < :publishedAt')
            ->setParameter('publishedAt', $publishedAt)
            ->getQuery()
            ->getResult();
    }
}
