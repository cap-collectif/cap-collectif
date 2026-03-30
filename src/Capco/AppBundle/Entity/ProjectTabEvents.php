<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ProjectTabType;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(name="project_tab_events")
 */
class ProjectTabEvents extends ProjectTab
{
    /**
     * @ORM\OneToMany(
     *     targetEntity="Capco\AppBundle\Entity\ProjectTabEventItem",
     *     mappedBy="projectTab",
     *     cascade={"persist", "remove"},
     *     orphanRemoval=true
     * )
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private Collection $eventItems;

    public function __construct()
    {
        $this->eventItems = new ArrayCollection();
    }

    public function getType(): string
    {
        return ProjectTabType::EVENTS;
    }

    public function getEventItems(): Collection
    {
        return $this->eventItems;
    }

    /**
     * @return array<Event>
     */
    public function getEvents(): array
    {
        $events = [];
        foreach ($this->eventItems as $eventItem) {
            $event = $eventItem->getEvent();
            if (!$event instanceof Event) {
                continue;
            }

            $events[] = $event;
        }

        return $events;
    }

    public function addEventItem(ProjectTabEventItem $eventItem): self
    {
        $eventItem->setProjectTab($this);

        if (!$this->eventItems->contains($eventItem)) {
            $this->eventItems->add($eventItem);
        }

        return $this;
    }

    public function removeEventItem(ProjectTabEventItem $eventItem): self
    {
        $this->eventItems->removeElement($eventItem);

        return $this;
    }
}
