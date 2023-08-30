<?php

declare(strict_types=1);

namespace spec\Capco\AppBundle\Repository;

use Capco\AppBundle\Repository\ProposalStatisticsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\QueryBuilder;
use PhpSpec\ObjectBehavior;

class ProposalStatisticsRepositorySpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalStatisticsRepository::class);
    }

    public function let(EntityManagerInterface $em, ClassMetadata $class, QueryBuilder $qb)
    {
        $alias = 'ps';
        $class->name = 'proposal_statistics';
        $em->createQueryBuilder()->willReturn($qb);
        $qb->select($alias)->willReturn($qb);
        $qb->from($class->name, $alias, null)->willReturn($qb);

        $this->beConstructedWith($em, $class);
    }
}
