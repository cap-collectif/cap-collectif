<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\Bundle\DoctrineBundle\EventSubscriber\EventSubscriberInterface;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\String\Slugger\SluggerInterface;

class StepSlugSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly SluggerInterface $slugger
    ) {
    }

    public function getSubscribedEvents(): array
    {
        return [
            Events::preUpdate,
            Events::prePersist,
        ];
    }

    public function preUpdate(PreUpdateEventArgs $args): void
    {
        $step = $args->getEntity();

        if (!$step instanceof AbstractStep) {
            return;
        }

        if ($step->getSlug()) {
            return;
        }

        $this->generateSlug($step);
    }

    public function prePersist(LifecycleEventArgs $args): void
    {
        $step = $args->getEntity();

        if (!$step instanceof AbstractStep) {
            return;
        }

        if ($step->getSlug()) {
            return;
        }

        $this->generateSlug($step);
    }

    /**
     * this is tested through an api test that can be found in the scenario :
     * should be able to update with the same label as another step within the project
     * in updateOtherStep.js.
     */
    private function generateSlug(AbstractStep $step): void
    {
        $sluggable = $step->getTitle() ?: $step->getLabel();

        $slug = $this->slugger->slug($sluggable)->lower()->toString();
        $project = $step->getProject();

        if (!$project) {
            $step->setSlug($slug);

            return;
        }

        $uniqueSlug = $slug;

        $allSteps = $project->getRealSteps();

        if ($step->getId()) {
            $allSteps = array_filter($allSteps, fn ($existingStep) => $existingStep->getId() !== $step->getId());
        }

        $existingStepSlugs = array_map(fn ($step) => $step->getSlug(), $allSteps);

        $counter = 1;

        while (\in_array($uniqueSlug, $existingStepSlugs)) {
            $uniqueSlug = $slug . '-' . $counter;
            ++$counter;
        }

        $step->setSlug($uniqueSlug);
    }
}
