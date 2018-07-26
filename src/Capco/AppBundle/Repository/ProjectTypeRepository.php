<?php
namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\ProjectVisibilityMode;
use Capco\AppBundle\Traits\ProjectVisibilityTrait;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProjectTypeRepository extends ServiceEntityRepository
{
    use ProjectVisibilityTrait;

    private $token;

    public function __construct(ManagerRegistry $registry, TokenStorageInterface $tokenStorage)
    {
        $this->token = $tokenStorage->getToken();
        parent::__construct($registry, ProjectType::class);
    }

    public function findAll($user = null)
    {
        return //            ->where('projects.visibility >= ' . $this->getVisibilityByViewer($user))
        $this->createQueryBuilder('p')
            ->select('p')
            ->leftJoin('p.projects', 'projects', Join::WITH, 'projects.projectType IS NOT NULL')
            ->where('projects.visibility >= ' . ProjectVisibilityMode::VISIBILITY_PUBLIC)
            ->groupBy('projects.id')
            ->distinct('p.id')
            ->getQuery()
            ->useQueryCache(true)
            ->useResultCache(true, 60)
            ->getArrayResult();
    }
}
