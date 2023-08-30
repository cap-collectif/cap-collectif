<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\ProposalFormAffiliation;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

class ProposalFormRepository extends EntityRepository
{
    /**
     * @param $id
     *
     * @throws \Doctrine\ORM\NonUniqueResultException
     *
     * @return mixed
     */
    public function getOne($id)
    {
        $qb = $this->createQueryBuilder('pf')
            ->addSelect('pf', 'p', 'q')
            ->leftJoin('pf.proposals', 'p')
            ->leftJoin('pf.questions', 'q')
            ->andWhere('pf.id = :id')
            ->setParameter('id', $id)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function searchByTerm(string $term): array
    {
        $qb = $this->createQueryBuilder('f');
        $qb->andWhere(
            $qb
                ->expr()
                ->andX(
                    $qb->expr()->like('f.title', $qb->expr()->literal('%' . $term . '%')),
                    $qb->expr()->isNull('f.step')
                )
        );

        return $qb->getQuery()->getResult();
    }

    public function getLastProposalReference(string $formId): int
    {
        $qb = $this->createQueryBuilder('f')
            ->select('MAX(p.reference) AS last_reference')
            ->leftJoin('f.proposals', 'p')
            ->where('f.id = :form_id')
            ->setParameter('form_id', $formId)
        ;

        return $qb->getQuery()->getSingleScalarResult() ?? 0;
    }

    public function getAll(
        ?int $offset,
        ?int $limit,
        ?array $affiliations,
        ?User $user,
        ?string $query,
        ?string $orderByField,
        ?string $orderByDirection,
        bool $availableOnly = false
    ) {
        $qb = $this->allQueryBuilder($affiliations, $user, $query, $availableOnly);

        if ($orderByField) {
            $qb->orderBy("pf.{$orderByField}", $orderByDirection);
        }
        if ($offset) {
            $qb->setFirstResult($offset);
        }
        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->execute();
    }

    public function countAll(
        ?array $affiliations,
        ?User $user,
        ?string $query,
        bool $availableOnly = false
    ): int {
        $qb = $this->allQueryBuilder($affiliations, $user, $query, $availableOnly);

        $qb->select('count(pf.id)');

        return $qb->getQuery()->getSingleScalarResult();
    }

    public function getByOwner(Owner $owner, int $offset, int $limit, array $options): array
    {
        $qb = $this->getByOwnerQueryBuilder($owner);
        if ($query = $options['query']) {
            $qb->andWhere('p.title LIKE :query');
            $qb->setParameter('query', "%{$query}%");
        }
        if ($options['availableOnly']) {
            $qb->andWhere('p.step IS NULL');
        }

        return $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    public function countByOwner(Owner $owner): int
    {
        return $this->getByOwnerQueryBuilder($owner)
            ->select('count(p.id)')
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function getNumberOfMessagesSent(ProposalForm $form): int
    {
        $result = $this->createQueryBuilder('pf')
            ->select('SUM(ps.nbrOfMessagesSentToAuthor)')
            ->leftJoin('pf.proposals', 'p')
            ->leftJoin('p.statistics', 'ps')
            ->andWhere('pf.id = :form_id')
            ->setParameter('form_id', $form->getId())
            ->getQuery()
            ->getSingleScalarResult()
        ;

        return $result ?? 0;
    }

    private function allQueryBuilder(
        ?array $affiliations,
        ?User $user,
        ?string $query,
        bool $availableOnly = false
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('pf');

        if ($query) {
            $qb->where('pf.title LIKE :query');
            $qb->setParameter('query', "%{$query}%");
        }
        if ($availableOnly) {
            $qb->andWhere('pf.step IS NULL');
        }

        if ($affiliations && \in_array(ProposalFormAffiliation::OWNER, $affiliations) && $user) {
            $qb->join('pf.owner', 'o');
            $qb->andWhere('pf.owner = :user');
            $qb->setParameter('user', $user);
        }

        return $qb;
    }

    private function getByOwnerQueryBuilder(Owner $owner): QueryBuilder
    {
        $ownerField = $owner instanceof User ? 'p.owner' : 'p.organizationOwner';

        return $this->createQueryBuilder('p')
            ->where("{$ownerField} = :owner")
            ->setParameter('owner', $owner)
        ;
    }
}
