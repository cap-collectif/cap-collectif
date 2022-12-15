<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\QueryBuilder;

/**
 * Class LocaleRepository.
 */
class LocaleRepository extends EntityRepository
{
    private const ORDER = ['code' => 'ASC'];
    private const RECETTE_KEY = 'ur-IN';

    public function findAll(bool $isSuperAdmin = false)
    {
        $qb = $this->createQueryBuilder('l')->orderBy('l.code', 'ASC');
        if (!$isSuperAdmin) {
            self::filterOutRecette($qb);
        }

        return $qb->getQuery()->getResult();
    }

    public function getValidCode(?string $userLocaleCode = null): string
    {
        $validCode = null;
        if ($userLocaleCode && $this->isCodePublished($userLocaleCode)) {
            $validCode = $userLocaleCode;
        }
        if (null === $validCode && $userLocaleCode) {
            $validCode = $this->getSimilarCode($userLocaleCode);
        }
        if (null === $validCode) {
            $validCode = $this->getDefaultCode();
        }

        return $validCode;
    }

    public function findEnabledLocalesCodes(): array
    {
        return array_map(function (Locale $locale) {
            return $locale->getCode();
        }, $this->findEnabledLocales());
    }

    public function findEnabledLocales(): array
    {
        return $this->findBy(['enabled' => true], self::ORDER);
    }

    public function findPublishedLocales(bool $isSuperAdmin = false): array
    {
        $qb = $this->createQueryBuilder('l');
        $qb->andWhere('l.published = true')->orderBy('l.code', 'ASC');
        if (!$isSuperAdmin) {
            self::filterOutRecette($qb);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @throws LocaleConfigurationException
     * @throws \Doctrine\ORM\ORMException
     * @throws \Doctrine\ORM\OptimisticLockException
     */
    public function findDefaultLocale(): Locale
    {
        /** @var $defaultLocale Locale */
        $defaultLocale = $this->findOneBy(['default' => true]);
        if (!$defaultLocale) {
            $defaultLocale = new Locale('fr-FR', 'french');
            $defaultLocale->enable();
            $defaultLocale->publish();
            $defaultLocale->setDefault();
            $em = $this->getEntityManager();
            $em->persist($defaultLocale);
            $em->flush();

            throw new LocaleConfigurationException(
                LocaleConfigurationException::MESSAGE_DEFAULT_NONE
            );
        }

        return $defaultLocale;
    }

    public function getDefaultCode(): string
    {
        $qb = $this->createQueryBuilder('l');
        $qb->select('l.code')->where('l.default = true');

        try {
            return $qb->getQuery()->getSingleResult()['code'];
        } catch (NoResultException $e) {
            throw new LocaleConfigurationException(
                LocaleConfigurationException::MESSAGE_DEFAULT_NONE
            );
        } catch (NonUniqueResultException $e) {
            throw new LocaleConfigurationException(
                LocaleConfigurationException::MESSAGE_DEFAULT_SEVERAL
            );
        }
    }

    public function isCodePublished(string $userLocaleCode): bool
    {
        $qb = $this->createQueryBuilder('l');
        $qb->select('COUNT(l.id)')
            ->where('l.code = :userCode')
            ->andWhere('l.published = true')
            ->setParameter('userCode', $userLocaleCode);

        return 0 < $qb->getQuery()->getSingleScalarResult();
    }

    public function isCodeEnabled(string $userLocaleCode): bool
    {
        $qb = $this->createQueryBuilder('l');
        $qb->select('COUNT(l.id)')
            ->where('l.code = :userCode')
            ->andWhere('l.enabled = true')
            ->setParameter('userCode', $userLocaleCode);

        return 0 < $qb->getQuery()->getSingleScalarResult();
    }

    // recette locale only for super admin
    private static function filterOutRecette(QueryBuilder $qb): void
    {
        $qb->andWhere('l.code != :code')->setParameter('code', self::RECETTE_KEY);
    }

    private function getSimilarCode(string $userCode): ?string
    {
        $qb = $this->createQueryBuilder('l');
        $qb->select('l.code')
            ->where('l.code LIKE :firstPartOfCode')
            ->setParameter('firstPartOfCode', substr($userCode, 0, 2));

        try {
            return $qb->getQuery()->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            //todo handle request for en-AUS while we have en-US and en-GB
        }

        return null;
    }
}
