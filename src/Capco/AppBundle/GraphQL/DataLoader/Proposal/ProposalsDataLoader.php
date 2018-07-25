<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;

class ProposalsDataLoader extends BatchDataLoader
{
    private $repository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        CacheItemPoolInterface $cache,
        ProposalRepository $repository
    ) {
        $this->repository = $repository;
        parent::__construct([$this, 'all'], $promiseFactory, $cache);
    }

    protected function all(array $keys)
    {
        $qb = $this->repository->createQueryBuilder('p');
        $qb->andWhere($qb->expr()->in('p.id', ':ids'))->setParameter('ids', $keys);
        $proposals = $qb->getQuery()->getResult();

        return $this->getPromiseAdapter()->createAll($proposals);
    }
}
