<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Event\StepSavedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class StepSlugSubscriber implements EventSubscriberInterface
{
    private SluggerInterface $slugger;

    public function __construct(SluggerInterface $slugger)
    {
        $this->slugger = $slugger;
    }

    public static function getSubscribedEvents(): array
    {
        return [StepSavedEvent::class => 'generateSlug'];
    }

    public function generateSlug(StepSavedEvent $event): void
    {
        $step = $event->getStep();
        $project = $step->getProject();
        $label = $step->getLabel();

        $slug = $this->slugger->slug($label)->lower()->toString();
        $uniqueSlug = $slug;

        $allSteps = $project->getRealSteps();

        if ($step->getId()) {
            $allSteps = array_filter($allSteps, function ($existingStep) use ($step) {
                return $existingStep->getId() !== $step->getId();
            });
        }

        $existingStepSlugs = array_map(function ($step) {
            return $step->getSlug();
        }, $allSteps);

        $counter = 1;

        while (\in_array($uniqueSlug, $existingStepSlugs)) {
            $uniqueSlug = $slug . '-' . $counter;
            ++$counter;
        }

        $step->setSlug($uniqueSlug);
    }
}
