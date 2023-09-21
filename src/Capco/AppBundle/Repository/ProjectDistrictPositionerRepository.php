<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Capco\AppBundle\Entity\Project;
use Doctrine\ORM\EntityRepository;

class ProjectDistrictPositionerRepository extends EntityRepository
{
    public function deleteExistingPositionersForProject(string $projectId): void
    {
        $this->createQueryBuilder('projectDistrictPositioner')
            ->delete(ProjectDistrictPositioner::class, 'p')
            ->where('p.project = :project')
            ->setParameter('project', $projectId)
            ->getQuery()
            ->execute()
        ;
    }

    public function remove(ProjectDistrictPositioner $positioner): void
    {
        $this->createQueryBuilder('projectDistrictPositioner')
            ->delete(ProjectDistrictPositioner::class, 'p')
            ->where('p = :positioner')
            ->setParameter('positioner', $positioner)
            ->getQuery()
            ->execute()
        ;

        $this->recomputePositions($positioner->getProject());
    }

    public function add(array $projectDistrictPositioners): void
    {
        $this->createQueryBuilder('projectDistrictPositioner')
            ->add('insert', 'INSERT INTO ' . ProjectDistrictPositioner::class . ' (id, project_id, district_id, position, created_at, updated_at) VALUES (:id, :project_id, :district_id, :position, :created_at, :updated_at)')
            ->setParameter('id', $projectDistrictPositioners['id'])
            ->setParameter('project_id', $projectDistrictPositioners['project_id'])
            ->setParameter('district_id', $projectDistrictPositioners['district_id'])
            ->setParameter('position', $projectDistrictPositioners['position'])
            ->setParameter('created_at', $projectDistrictPositioners['created_at'])
            ->getQuery()
            ->execute()
        ;
    }

    public function recomputePositions(Project $project): void
    {
        $remainingPositioners = $this->createQueryBuilder('projectDistrictPositioner')
            ->leftJoin('projectDistrictPositioner.project', 'project')
            ->where('project.id = :projectId')
            ->orderBy('projectDistrictPositioner.position', 'ASC')
            ->setParameter('projectId', $project->getId())
            ->getQuery()
            ->getResult()
        ;

        foreach ($remainingPositioners as $key => $positioner) {
            $positioner->setPosition($key + 1);

            $this->_em->persist($positioner);
        }
    }

    public function getNextAvailablePosition(Project $project): int
    {
        $lastPositioner = $this->createQueryBuilder('projectDistrictPositioner')
            ->leftJoin('projectDistrictPositioner.project', 'project')
            ->where('project.id = :projectId')
            ->orderBy('projectDistrictPositioner.position', 'DESC')
            ->setParameter('projectId', $project->getId())
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()
        ;

        return $lastPositioner ? $lastPositioner->getPosition() + 1 : 1;
    }
}
