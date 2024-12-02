<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Repository\ProjectAbstractStepRepository;
use Doctrine\Common\Collections\Criteria;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProjectStepsResolver implements QueryInterface
{
    public function __invoke(Project $project, Argument $arguments): iterable
    {
        $excludePresentationStep = $arguments['excludePresentationStep'] ?? false;
        $projectAbstractSteps = $project
            ->getSteps()
            ->matching(
                ProjectAbstractStepRepository::createOrderedByCritera([
                    'position' => Criteria::ASC,
                ])
            )
        ;

        if ($excludePresentationStep) {
            $projectAbstractSteps = $projectAbstractSteps->filter(function ($projectAbstractStep) {
                $step = $projectAbstractStep->getStep();

                return false === $step instanceof PresentationStep;
            });
        }

        $steps = $projectAbstractSteps
            ->map(static fn (ProjectAbstractStep $pas) => $pas->getStep())
            ->toArray()
        ;

        return $steps;
    }
}
