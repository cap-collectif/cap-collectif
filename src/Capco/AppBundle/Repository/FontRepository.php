<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Font;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;

/**
 * @method Font|null find($id, $lockMode = null, $lockVersion = null)
 * @method Font|null findOneBy(array $criteria, array $orderBy = null)
 * @method Font[]    findAll()
 * @method Font[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FontRepository extends EntityRepository
{
    private const DEFAULT_FONT = 'Open Sans';

    /**
     * @return iterable|Font[]
     */
    public function findAllGroupedByName(): iterable
    {
        return $this->createQueryBuilder('f')
            ->groupBy('f.name')
            ->addOrderBy('f.isCustom', 'ASC')
            ->addOrderBy('f.name', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByUploadedFont(array $font): ?Font
    {
        $qb = $this->createQueryBuilder('f');

        return $qb
            ->andWhere($qb->expr()->eq('f.weight', ':weight'))
            ->andWhere($qb->expr()->eq('f.name', ':name'))
            ->andWhere($qb->expr()->eq('f.style', ':style'))
            ->andWhere($qb->expr()->eq('f.fullname', ':fullname'))
            ->setParameters([
                'weight' => $font['weight'],
                'name' => $font['name'],
                'style' => $font['style'],
                'fullname' => $font['fullname']
            ])
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function getCurrentHeadingFont(): ?Font
    {
        $qb = $this->createQueryBuilder('f');

        $results = $qb
            ->having($qb->expr()->eq('f.useAsHeading', true))
            ->addGroupBy('f.name')
            ->setMaxResults(1)
            ->getQuery()
            ->getResult();

        return \count($results) > 0 ? $results[0] : null;
    }

    public function getCurrentBodyFont(): ?Font
    {
        $qb = $this->createQueryBuilder('f');

        $results = $qb
            ->having($qb->expr()->eq('f.useAsBody', true))
            ->addGroupBy('f.name')
            ->setMaxResults(1)
            ->getQuery()
            ->getResult();

        return \count($results) > 0 ? $results[0] : null;
    }

    /**
     * @return Font[]
     *
     * @throws NonUniqueResultException
     */
    public function getActiveHeadingFonts(): iterable
    {
        $qb = $this->createQueryBuilder('f');

        return $qb
            ->where($qb->expr()->eq('f.useAsHeading', true))
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Font[]
     *
     * @throws NonUniqueResultException
     */
    public function getActiveBodyFonts(): iterable
    {
        $qb = $this->createQueryBuilder('f');

        return $qb
            ->where($qb->expr()->eq('f.useAsBody', true))
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Font[]
     */
    public function getCustomActiveFonts(): iterable
    {
        $qb = $this->createQueryBuilder('f');

        return $qb
            ->where(
                'f.isCustom = 1 AND f.file IS NOT NULL AND (f.useAsBody = 1 OR f.useAsHeading = 1)'
            )
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Font[]
     */
    public function getCustomFonts(): iterable
    {
        $qb = $this->createQueryBuilder('f');

        return $qb
            ->where('f.isCustom = 1 AND f.file IS NOT NULL')
            ->getQuery()
            ->getResult();
    }

    public function getLastUploadedFont(): ?Font
    {
        $baseQuery = $this->createQueryBuilder('f')
            ->setMaxResults(1)
            ->addOrderBy('f.createdAt', 'DESC');

        $lastFont = (clone $baseQuery)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        $normalFont = (clone $baseQuery)
            ->where('f.name = :name AND f.weight = :weight AND f.style = :style')
            ->setParameters([
                'name' => $lastFont->getName(),
                'style' => 'normal',
                'weight' => 400
            ])
            ->getQuery()
            ->getResult();

        if (0 === \count($normalFont)) {
            $result = (clone $baseQuery)
                ->where('f.name = :name AND f.weight <= :weight AND f.style = :style')
                ->setParameters([
                    'name' => $lastFont->getName(),
                    'style' => 'normal',
                    'weight' => 900
                ])
                ->addOrderBy('f.weight', 'DESC')
                ->getQuery()
                ->getResult();

            return \count($result) > 0 ? $result[0] : $lastFont;
        }

        return $normalFont[0];
    }

    public function getDefaultFont(): ?Font
    {
        $qb = $this->createQueryBuilder('f');

        return $qb
            ->andWhere($qb->expr()->eq('f.name', ':name'))
            ->setParameter('name', self::DEFAULT_FONT)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return iterable|Font[]
     */
    public function getSameFamilyFonts(Font $font): iterable
    {
        $qb = $this->createQueryBuilder('f');

        return $qb
            ->andWhere($qb->expr()->eq('f.name', ':name'))
            ->setParameter('name', $font->getName())
            ->getQuery()
            ->getResult();
    }
}
