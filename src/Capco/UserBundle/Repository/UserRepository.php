<?php

namespace Capco\UserBundle\Repository;

use Doctrine\ORM\EntityRepository;

use Capco\AppBundle\Entity\Consultation;

/**
 * UserRepository.
 */
class UserRepository extends EntityRepository
{
    public function findConsultationSourceContributorsWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
                   ->select('u.id', 'count(distinct sources) as sources_count')
                   ->leftJoin('u.sources', 'sources', 'WITH', 'sources.isEnabled = 1')
                   ->leftJoin('sources.Opinion', 'sources_opinion', 'WITH', 'sources_opinion.isEnabled = 1')
                   ->where('sources_opinion.Consultation = :consultation')
                   ->groupBy('u')
                   ->setParameter('consultation', $consultation)
                ;
        return $qb->getQuery()->getResult();
    }

    public function findConsultationArgumentContributorsWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
                   ->select('u.id', 'count(distinct arguments) as arguments_count')
                   ->leftJoin('u.arguments', 'arguments', 'WITH', 'arguments.isEnabled = 1')
                   ->leftJoin('arguments.opinion', 'arguments_opinion', 'WITH', 'arguments_opinion.isEnabled = 1')
                   ->where('arguments_opinion.Consultation = :consultation')
                   ->groupBy('u')
                   ->setParameter('consultation', $consultation)
                ;
        return $qb->getQuery()->getResult();
    }

    public function findConsultationOpinionContributorsWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
                    ->select('u.id', 'count(distinct opinions) as opinions_count')
                    ->leftJoin('u.opinions', 'opinions', 'WITH', 'opinions.isEnabled = 1')
                    ->where('opinions.Consultation = :consultation')
                    ->groupBy('u')
                    ->setParameter('consultation', $consultation)
            ;
        return $qb->getQuery()->getResult();
    }

    public function findConsultationOpinionVotersWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
                    ->select('u.id', 'count(distinct opinions_votes) as opinions_votes_count')
                    ->leftJoin('CapcoAppBundle:OpinionVote', 'opinions_votes', 'WITH', 'opinions_votes.user = u AND opinions_votes.confirmed = 1')
                    ->leftJoin('opinions_votes.opinion', 'opinions_votes_opinion', 'WITH', 'opinions_votes_opinion.isEnabled = 1')
                    ->where('opinions_votes_opinion.Consultation = :consultation')
                    ->groupBy('u')
                    ->setParameter('consultation', $consultation)
            ;
        return $qb->getQuery()->getResult();
    }

    public function findConsultationArgumentVotersWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
                    ->select('u.id', 'count(distinct arguments_votes) as arguments_votes_count')
                    ->leftJoin('CapcoAppBundle:ArgumentVote', 'arguments_votes', 'WITH', 'arguments_votes.user = u AND arguments_votes.confirmed = 1')
                    ->leftJoin('arguments_votes.argument', 'arguments_votes_argument', 'WITH', 'arguments_votes_argument.isEnabled = 1')
                    ->leftJoin('arguments_votes_argument.opinion', 'arguments_votes_argument_opinion', 'WITH', 'arguments_votes_argument_opinion.isEnabled = 1')
                    ->where('arguments_votes_argument_opinion.Consultation = :consultation')
                    ->groupBy('u')
                    ->setParameter('consultation', $consultation)
            ;
        return $qb->getQuery()->getResult();
    }

    public function findConsultationSourceVotersWithCount(Consultation $consultation)
    {
        $qb = $this->createQueryBuilder('u')
                    ->select('u.id', 'count(distinct sources_votes) as sources_votes_count')
                    ->leftJoin('CapcoAppBundle:SourceVote', 'sources_votes', 'WITH', 'sources_votes.user = u AND sources_votes.confirmed = 1')
                    ->leftJoin('sources_votes.source', 'sources_votes_source', 'WITH', 'sources_votes_source.isEnabled = 1')
                    ->leftJoin('sources_votes_source.Opinion', 'sources_votes_source_opinion', 'WITH', 'sources_votes_source_opinion.isEnabled = 1')
                    ->where('sources_votes_source_opinion.Consultation = :consultation')
                    ->groupBy('u')
                    ->setParameter('consultation', $consultation)
            ;
        return $qb->getQuery()->getResult();
    }

    public function findWithMediaByIds($ids)
    {
        $qb = $this->createQueryBuilder('u');
            $qb->addSelect('m')
               ->leftJoin('u.Media', 'm')
               ->where('u.id IN (:ids)')
               ->setParameter('ids', $ids)
        ;
        return $qb->getQuery()->getResult();
    }
}
