<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\GraphQL\DataLoader\GenericDataLoader;
use Capco\AppBundle\Repository\ProposalRepository;
use GraphQL\Executor\Promise\Promise;
use Overblog\DataLoader\CacheMap;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;

class ProposalDataLoader extends GenericDataLoader
{
    private $repository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        CacheMap $cacheMap,
        CacheItemPoolInterface $cache,
        ProposalRepository $repository
    ) {
        $this->repository = $repository;
        parent::__construct([$this, 'all'], $promiseFactory, $cacheMap, $cache);
    }

    public function all(array $ids): Promise
    {
        $qb = $this->repository->createQueryBuilder('p');
        $qb->add('where', $qb->expr()->in('p.id', ':ids'))->setParameter('ids', $ids);

        return $this->getPromiseAdapter()->createAll($ids);
    }
}
