<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait StartAndEndDatesTrait
{
    /**
     * @var \DateTime
     *
     * @ORM\Column(name="start_at", type="datetime")
     * @Assert\NotBlank()
     */
    private $startAt;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="end_at", type="datetime", nullable=true)
     */
    private $endAt = null;

    /**
     * Get startAt.
     *
     * @return \DateTime
     */
    public function getStartAt()
    {
        return $this->startAt;
    }

    /**
     * Set startAt.
     *
     * @param \DateTime $startAt
     *
     * @return Step
     */
    public function setStartAt($startAt)
    {
        $this->startAt = $startAt;

        return $this;
    }

    /**
     * Get endAt.
     *
     * @return \DateTime
     */
    public function getEndAt()
    {
        return $this->endAt;
    }

    /**
     * Set endAt.
     *
     * @param \DateTime $endAt
     *
     * @return Step
     */
    public function setEndAt($endAt)
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function extractDate($datetime)
    {
        return $datetime->format('Ymd');
    }

    public function getYear($datetime)
    {
        return $datetime->format('Y');
    }

    public function getMonth($datetime)
    {
        return $datetime->format('m');
    }

    public function getDay($datetime)
    {
        return $datetime->format('d');
    }

    public function isSameDate($dt1, $dt2)
    {
        return $this->extractDate($dt1) == $this->extractDate($dt2);
    }

    public function lastOneDay()
    {
        if ($this->endAt == null) {
            return true;
        }

        return $this->isSameDate($this->startAt, $this->endAt);
    }

    public function getStartYear()
    {
        return $this->getYear($this->startAt);
    }

    public function getStartMonth()
    {
        return $this->getMonth($this->startAt);
    }

    public function getRemainingDays()
    {
        $now = new \DateTime();
        if ($this->isOpen()) {
            if (null != $this->endAt) {
                return $this->endAt->diff($now)->format('%a');
            }
            return $this->startAt->diff($now)->format('%a');
        }

        return null;
    }

    public function isOpen()
    {
        $now = new \DateTime();

        if ($this->endAt == null) {
            return $this->startAt < $now && $this->isSameDate($this->startAt, $now);
        }

        return $this->startAt < $now && $this->endAt > $now;
    }

    public function isClosed()
    {
        $now = new \DateTime();

        if ($this->endAt == null) {
            return $this->extractDate($this->startAt) < $this->extractDate($now);
        }

        return $this->endAt < $now;
    }

    public function isFuture()
    {
        $now = new \DateTime();
        return $this->startAt > $now;
    }

    /**
     * @return int|null
     */
    public function getOpeningStatus()
    {
        if ($this->isFuture()) {
            return 'future';
        }
        if ($this->isClosed()) {
            return 'closed';
        }
        if ($this->isOpen()) {
            return 'open';
        }

        return null;
    }
}
