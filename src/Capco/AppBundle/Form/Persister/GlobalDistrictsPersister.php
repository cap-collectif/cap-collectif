<?php

namespace Capco\AppBundle\Form\Persister;

use Capco\AppBundle\Entity\District\ProjectDistrictPositioner;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\ProjectDistrictPositionerRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;

class GlobalDistrictsPersister
{
    public function __construct(private readonly ProjectDistrictPositionerRepository $districtPositionerRepository, private readonly GlobalDistrictRepository $globalDistrictRepository, private readonly EntityManagerInterface $em)
    {
    }

    public function persist(array $districtsIds, Project $project): void
    {
        $districtsIds = array_map(
            fn ($districtGlobalId) => GlobalIdResolver::getDecodedId($districtGlobalId, true),
            $districtsIds
        );
        $districtEntities = $this->globalDistrictRepository->findByIds($districtsIds);

        $oldPositioners = $this->districtPositionerRepository->findBy([
            'project' => $project,
        ]);

        if (
            [] === $districtsIds
            && [] === $districtEntities
            && [] === $oldPositioners
        ) {
            return;
        }

        foreach ($oldPositioners as $key => $oldPositioner) {
            if (!\in_array($oldPositioner->getDistrict()->getId(), $districtsIds, true)) {
                $oldPositioner->setProject(null);
                $oldPositioner->setDistrict(null);
                $this->em->remove($oldPositioner);
                unset($oldPositioners[$key]);
            }
        }

        if ([] !== $oldPositioners) {
            $project->setProjectDistrictPositioners(new ArrayCollection($oldPositioners));
        }

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
