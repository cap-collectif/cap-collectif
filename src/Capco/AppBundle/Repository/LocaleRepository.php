<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;

/**
 * Class LocaleRepository.
 */
class LocaleRepository extends EntityRepository
{
    private const ORDER = ['code' => 'ASC'];

    public function findAll()
    {
        return $this->findBy([], self::ORDER);
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

    public function findEnabledLocales(): array
    {
        return $this->findBy(['enabled' => true], self::ORDER);
    }

    public function findPublishedLocales(): array
    {
        return $this->findBy(['published' => true], self::ORDER);
    }

    public function findDefaultLocale(): Locale
    {
        $defaultLocale = $this->findOneBy(['default' => true]);
        if (!$defaultLocale) {
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

    private function getSimilarCode(string $userCode): ?string
    {
        $qb = $this->createQueryBuilder('l');
        $qb
            ->select('l.code')
            ->where('l.code LIKE :firstPartOfCode')
            ->setParameter('firstPartOfCode', substr($userCode, 0, 2));

        try {
            return $qb->getQuery()->getOneOrNullResult();
        } catch (NonUniqueResultException $e) {
            //todo handle request for en-AUS while we have en-US and en-GB
        }
    }

    private function isCodePublished(string $userLocaleCode): bool
    {
        $qb = $this->createQueryBuilder('l');
        $qb
            ->select('COUNT(l.id)')
            ->where('l.code = :userCode')
            ->setParameter('userCode', $userLocaleCode);

        return 0 < $qb->getQuery()->getSingleScalarResult();
    }
}
