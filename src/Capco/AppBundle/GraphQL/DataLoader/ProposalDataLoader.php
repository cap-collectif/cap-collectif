<?php
namespace Capco\AppBundle\GraphQL\DataLoader;

use Capco\AppBundle\Repository\ProposalRepository;
use GraphQL\Executor\Promise\PromiseAdapter;

class ProposalDataLoader
{
    private $promiseAdapter;
    private $repository;

    public function __construct(PromiseAdapter $promiseAdapter, ProposalRepository $repository)
    {
        $this->repository = $repository;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function all(array $proposalsIds): \GraphQL\Executor\Promise\Promise
    {
        $qb = $this->repository->createQueryBuilder('p');
        $results = $qb
            ->add('where', $qb->expr()->in('p.id', ':ids'))
            ->setParameter('ids', $proposalsIds)
            ->getQuery()
            ->getResult();

        return $this->promiseAdapter->all($results);
    }
}
