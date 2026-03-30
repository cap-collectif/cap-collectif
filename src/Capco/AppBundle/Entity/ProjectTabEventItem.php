<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *     name="project_tab_event_item",
 *     uniqueConstraints={
 *         @ORM\UniqueConstraint(name="project_tab_event_item_unique", columns={"project_tab_id", "event_id"})
 *     }
 * )
 */
class ProjectTabEventItem implements EntityInterface
{
    use PositionableTrait;
    use UuidTrait;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\ProjectTabEvents", inversedBy="eventItems", cascade={"persist"})
     * @ORM\JoinColumn(name="project_tab_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private ?ProjectTabEvents $projectTab = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Event", cascade={"persist"})
     * @ORM\JoinColumn(name="event_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     * @Assert\NotNull()
     */
    private ?Event $event = null;

    public function getProjectTab(): ?ProjectTabEvents
    {
        return $this->projectTab;
    }

    public function setProjectTab(ProjectTabEvents $projectTab): self
    {
        $this->projectTab = $projectTab;

        return $this;
    }

    public function getEvent(): ?Event
    {
        return $this->event;
    }

    public function setEvent(Event $event): self
    {
        $this->event = $event;

        return $this;
    }
}
