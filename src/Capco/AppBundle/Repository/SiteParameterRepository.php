<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

/**
 * @method null|SiteParameter findOneBy(array $criteria, array $orderBy = null)
 */
class SiteParameterRepository extends EntityRepository
{
    final public const REGISTRATION_PAGE_CODE_KEYNAME = 'registration.customcode';

    public static function getValuesIfEnabledCacheKey(string $locale): string
    {
        return 'SiteParameterRepository_getValuesIfEnabled_resultcache_' . $locale;
    }

    public static function getValueCacheKey(string $locale, string $keyname): string
    {
        return 'SiteParameterRepository_getValue_resultcache_' . $locale . $keyname;
    }

    /**
     * @return SiteParameter[]
     */
    public function getValues(string $locale): array
    {
        return $this->getEntityManager()
            ->createQueryBuilder()
            ->from($this->getClassName(), 'p', 'p.keyname')
            ->leftJoin('p.translations', 't', Join::WITH, 't.locale = :locale')
            ->select('p', 't')
            ->andWhere('p.isEnabled = 1')
            ->groupBy('p.keyname')
            ->setParameter('locale', $locale)
            ->getQuery()
            ->getResult()
        ;
    }

    public function getValue(string $keyname, string $locale): ?string
    {
        $qb = $this->getEntityManager()
            ->createQueryBuilder()
            ->from($this->getClassName(), 'p')
            ->andWhere('p.isEnabled = 1')
            ->andWhere('p.keyname = :keyname')
            ->setParameter('keyname', $keyname)
        ;

        if (\in_array($keyname, SiteParameter::NOT_TRANSLATABLE)) {
            $qb->select('p.value');
        } else {
            $qb->select('t.value')
                ->leftJoin('p.translations', 't', Join::WITH, 't.locale = :locale')
                ->setParameter('locale', $locale)
            ;
        }

        return $qb
            ->getQuery()
            ->useQueryCache(true)
            ->enableResultCache(60, self::getValueCacheKey($locale, $keyname))
            ->getSingleResult()['value'];
    }
}
