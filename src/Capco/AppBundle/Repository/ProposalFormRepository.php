<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\SectionQuestion;
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

    /**
     * @param array<int, string> $proposalsIds
     *
     * @return array<int|string, array<int, mixed>>
     */
    public function getQuestionsResponsesByProposalsIds(array $proposalsIds): array
    {
        $qbAbstractQuestion = $this->_em->createQueryBuilder();
        $qbAbstractQuestion
            ->from('CapcoAppBundle:Questions\AbstractQuestion', 'aq')
            ->select('q.id, q.title')
            ->leftJoin('aq.questionnaireAbstractQuestion', 'qaq')
            ->leftJoin('qaq.question', 'q')
            ->leftJoin('q.responses', 'r')
            ->leftJoin('qaq.proposalForm', 'pf')
            ->leftJoin('pf.proposals', 'p')
            ->where('p.id IN (:proposalsIds)')
            ->setParameter('proposalsIds', $proposalsIds)
            ->andWhere('q NOT INSTANCE OF :sectionQuestion')
            ->setParameter('sectionQuestion', $this->_em->getClassMetadata(SectionQuestion::class))
        ;

        $questions = $qbAbstractQuestion->getQuery()->getResult();
        $questionTitles = [];
        foreach ($questions as $question) {
            $questionTitles[$question['id']] = $question['title'];
        }

        $questionIds = array_keys($questionTitles);

        $qbMediaResponse = $this->_em->createQueryBuilder();
        $qbMediaResponse
            ->from('CapcoAppBundle:Responses\MediaResponse', 'mr')
            ->select('q.id as question_id', 'q.title', 'mr as responses')
            ->leftJoin('mr.question', 'q')
            ->where('q.id IN (:questions)')
            ->andWhere('mr.user IS NOT NULL')
            ->setParameter('questions', $questionIds)
        ;
        $mediaResponses = $qbMediaResponse->getQuery()->getResult();

        $qbAbstractResponse = $this->_em->createQueryBuilder();
        $qbAbstractResponse
            ->from('CapcoAppBundle:Responses\ValueResponse', 'vr')
            ->select('q.id as question_id', 'q.title', 'vr as responses')
            ->leftJoin('vr.question', 'q')
            ->where('q.id IN (:questions)')
            ->andWhere('vr.user IS NOT NULL')
            ->setParameter('questions', $questionIds)
        ;
        $valueResponses = $qbAbstractResponse->getQuery()->getResult();

        $results = array_merge($valueResponses, $mediaResponses);

        usort(
            $results,
            static fn ($a, $b) => strcmp(
                $a['responses']->getQuestion()?->getTemporaryId() ?? '',
                $b['responses']->getQuestion()?->getTemporaryId() ?? ''
            )
        );
        $mappedResults = [];
        foreach ($questionTitles as $title) {
            $mappedResults[$title] = [];
        }

        foreach ($results as $result) {
            $mappedResults[$result['title']][] = $result['responses'];
        }

        return $mappedResults;
    }

    public function searchByTerm(string $term): array
    {
        $qb = $this->createQueryBuilder('f');
        $qb->andWhere(
            $qb
                ->expr()
                ->andX(
                    $qb->expr()->like('f.title', $qb->expr()->literal('%' . $term . '%')),
                )
        );

        return $qb->getQuery()->getResult();
    }

    public function allocateNextProposalReference(string $formId): ?int
    {
        $connection = $this->_em->getConnection();
        $updatedRows = $connection->executeStatement(
            'UPDATE proposal_form SET last_proposal_reference = LAST_INSERT_ID(last_proposal_reference + 1) WHERE id = :form_id',
            ['form_id' => $formId]
        );

        if (0 === $updatedRows) {
            return null;
        }

        return (int) $connection->lastInsertId();
    }

    public function synchronizeLastProposalReference(string $formId, int $reference): void
    {
        $this->_em->getConnection()->executeStatement(
            'UPDATE proposal_form SET last_proposal_reference = GREATEST(last_proposal_reference, :reference) WHERE id = :form_id',
            ['form_id' => $formId, 'reference' => $reference]
        );
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
