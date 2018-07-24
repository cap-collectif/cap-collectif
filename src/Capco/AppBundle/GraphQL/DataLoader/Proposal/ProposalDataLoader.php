<?php
namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\GraphQL\DataLoader\GenericDataLoader;
use Capco\AppBundle\Repository\ProposalRepository;
use GraphQL\Executor\Promise\Promise;
use GraphQL\Executor\Promise\PromiseAdapter;
use Overblog\DataLoader\CacheMap;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Cache\CacheItemPoolInterface;

class ProposalDataLoader
{
    private $repository;
    private $promiseAdapter;

    public function __construct(PromiseAdapter $promiseAdapter, ProposalRepository $repository)
    {
        $this->repository = $repository;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function all(array $ids): Promise
    {
        $qb = $this->repository->createQueryBuilder('p');
        $proposals = $qb
            ->add('where', $qb->expr()->in('p.id', ':ids'))
            ->setParameter('ids', $ids)
            ->getQuery()
            ->getResult();

        return $this->promiseAdapter->all($proposals);
    }
}
