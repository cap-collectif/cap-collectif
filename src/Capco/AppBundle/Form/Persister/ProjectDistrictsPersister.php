<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProjectDistrictPositionerRepository;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

class ProjectDistrictsPersister
{
    private ProjectDistrictPositionerRepository $districtPositionerRepository;
    private ProjectDistrictRepository $projectDistrictRepository;
    private EntityManagerInterface $em;

    public function __construct(
        ProjectDistrictPositionerRepository $districtPositionerRepository,
        ProjectDistrictRepository $projectDistrictRepository,
        EntityManagerInterface $em
    ) {
        $this->districtPositionerRepository = $districtPositionerRepository;
        $this->projectDistrictRepository = $projectDistrictRepository;
        $this->em = $em;
    }

    public function persist(array $districtsIds, Project $project)
    {
        $districtsIds = array_map(function ($districtGlobalId) {
            return GlobalIdResolver::getDecodedId($districtGlobalId, true);
        }, $districtsIds);
        $districtEntities = $this->projectDistrictRepository->findByIds($districtsIds);

        $oldPositioners = $this->districtPositionerRepository->findBy([
            'project' => $project,
        ]);

        foreach ($oldPositioners as $key => $oldPositioner) {
            if (!\in_array($oldPositioner->getDistrict()->getId(), $districtsIds, true)) {
                $oldPositioner->setProject(null);
                $oldPositioner->setDistrict(null);
                $this->em->remove($oldPositioner);
                unset($oldPositioners[$key]);
            }
        }
        $project->setProjectDistrictPositioners(new ArrayCollection($oldPositioners));
        $this->recomputePositions($oldPositioners);

        $nextPosition = $this->districtPositionerRepository->getNextAvailablePosition($project);
        foreach ($districtEntities as $district) {
            $hasPosition = array_filter(
                $oldPositioners,
                fn (ProjectDistrictPositioner $positioner) => $positioner->getDistrict()->getId() === $district->getId()
            );

            if ($hasPosition) {
                continue;
            }

            $positioner = new ProjectDistrictPositioner();
            $positioner
                ->setProject($project)
                ->setDistrict($district)
                ->setPosition($nextPosition++)
            ;

            $updatedPositioners[] = $positioner;
            $this->em->persist($positioner);
        }
    }

    private function recomputePositions(array $oldPositioners): void
    {
        $firstPosition = 1;
        foreach ($oldPositioners as $key => $positioner) {
            $positioner->setPosition($firstPosition++);

            $this->em->persist($positioner);
        }
    }
}
