<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventDistrictPositionerRepository")
 * @ORM\Table(
 *  name="event_district_positioner",
 *  uniqueConstraints={
 *     @ORM\UniqueConstraint(
 *        name="event_district_position_unique",
 *        columns={"event_id", "district_id", "position"}
 *     ),
 *  })
 */
class EventDistrictPositioner implements \Stringable
{
    use PositionableTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\District\GlobalDistrict", inversedBy="eventDistrictPositioners")
     */
    private GlobalDistrict $district;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Event", inversedBy="eventDistrictPositioners")
     */
    private Event $event;

    public function __toString(): string
    {
        return (string) $this->getDistrict()->getName();
    }

    public function getDistrict(): GlobalDistrict
    {
        return $this->district;
    }

    public function setDistrict(GlobalDistrict $district): self
    {
        $this->district = $district;

        return $this;
    }

    public function getEvent(): Event
    {
        return $this->event;
    }

    public function setEvent(Event $event): self
    {
        $this->event = $event;

        return $this;
    }
}
