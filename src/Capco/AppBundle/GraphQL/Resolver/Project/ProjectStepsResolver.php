<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Repository\ProjectAbstractStepRepository;
use Doctrine\Common\Collections\Criteria;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProjectStepsResolver implements ResolverInterface
{
    public function __invoke(Project $project): iterable
    {
        $steps = array_filter(
            $project
                ->getSteps()
                ->matching(
                    ProjectAbstractStepRepository::createOrderedByCritera([
                        'position' => Criteria::ASC
                    ])
                )
                ->map(static function (ProjectAbstractStep $pas) {
                    return $pas->getStep();
                })
                ->toArray()
        );

        return $steps;
    }
}
