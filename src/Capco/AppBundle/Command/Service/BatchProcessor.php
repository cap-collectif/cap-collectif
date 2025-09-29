<?php

namespace Capco\AppBundle\Command\Service;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Output\OutputInterface;

class BatchProcessor
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @param array<string, Opinion|Proposal|User> $parameters
     *
     * @return array<ExportableContributionInterface>
     */
    public function processQueryInBatches(
        string $entityClass,
        string $alias,
        string $condition,
        array $parameters,
        int $batchSize,
        OutputInterface $output,
        ?callable $callback = null,
        ?string $conditionJoin = null,
        ?string $aliasJoin = null
    ): array {
        $offset = 0;
        $contributions = [];

        do {
            $queryBuilder = $this->entityManager->createQueryBuilder()
                ->select($alias)
                ->from($entityClass, $alias)
            ;

            if (isset($conditionJoin, $aliasJoin)) {
                $queryBuilder->leftJoin($conditionJoin, $aliasJoin);
            }

            $queryBuilder
                ->where($condition)
                ->setFirstResult($offset)
                ->setMaxResults($batchSize)
            ;

            foreach ($parameters as $key => $value) {
                $queryBuilder->setParameter($key, $value);
            }

            $iterableResult = $queryBuilder->getQuery()->toIterable();

            $i = 0;
            foreach ($iterableResult as $entity) {
                $contributions[] = $entity;
                if (null !== $callback) {
                    $callback($entity);
                }
                ++$i;
            }

            $offset += $batchSize;
        } while ($batchSize === $i);

        return $contributions;
    }
}
