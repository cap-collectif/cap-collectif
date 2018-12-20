<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Enum\MapProviderEnum;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\QueryBuilder;

class MapTokenRepository extends EntityRepository
{
    public function getCurrentMapTokenForProvider(string $provider): ?MapToken
    {
        if (!MapProviderEnum::isProviderValid($provider)) {
            throw new \InvalidArgumentException(
                sprintf(
                    "Invalid provider '%s'. Available providers : %s",
                    $provider,
                    implode(', ', MapProviderEnum::getAvailableProviders())
                )
            );
        }

        $qb = $this->getQueryBuilder();

        return $qb
            ->andWhere($qb->expr()->eq('mt.provider', ':provider'))
            ->setParameter('provider', $provider)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return MapToken[]
     */
    public function getMapTokensGroupByProviders(): array
    {
        $qb = $this->getQueryBuilder();

        return $qb
            ->groupBy('mt.provider')
            ->getQuery()
            ->getResult();
    }

    private function getQueryBuilder(): QueryBuilder
    {
        return $this->createQueryBuilder('mt');
    }
}
