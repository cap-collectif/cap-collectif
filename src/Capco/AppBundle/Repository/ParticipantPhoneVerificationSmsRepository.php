<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ParticipantPhoneVerificationSms;
use Capco\AppBundle\Traits\Repository\PhoneVerification;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;

/**
 * @extends EntityRepository<ParticipantPhoneVerificationSmsRepository>
 *
 * @method null|ParticipantPhoneVerificationSms find($id, $lockMode = null, $lockVersion = null)
 * @method null|ParticipantPhoneVerificationSms findOneBy(array $criteria, array $orderBy = null)
 * @method ParticipantPhoneVerificationSms[]    findAll()
 * @method ParticipantPhoneVerificationSms[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ParticipantPhoneVerificationSmsRepository extends EntityRepository
{
    use PhoneVerification;

    /**
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function add(ParticipantPhoneVerificationSms $entity, bool $flush = true): void
    {
        $this->_em->persist($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }

    /**
     * @throws ORMException
     * @throws OptimisticLockException
     */
    public function remove(ParticipantPhoneVerificationSms $entity, bool $flush = true): void
    {
        $this->_em->remove($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }

    public function findLastByCreatedAtAndParticipant(Participant $participant): ?ParticipantPhoneVerificationSms
    {
        return $this->createQueryBuilder('p')
            ->orderBy('p.createdAt', 'DESC')
            ->where('p.participant = :participant')
            ->setParameter('participant', $participant)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
