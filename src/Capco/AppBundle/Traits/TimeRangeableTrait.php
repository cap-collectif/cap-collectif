<?php

namespace Capco\AppBundle\Traits;

trait TimeRangeableTrait
{
    public function getStartAt(): ?\DateTime
    {
        return $this->startAt;
    }

    public function setStartAt(?\DateTime $startAt = null): self
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): ?\DateTime
    {
        return $this->endAt;
    }

    public function setEndAt(?\DateTime $endAt = null): self
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function hasStarted(): bool
    {
        if ($this->isTimeless()) {
            return true;
        }

        $now = new \DateTime('now');

        if (null !== $this->startAt) {
            return $now >= $this->startAt;
        }

        return false;
    }

    public function hasEnded(): bool
    {
        if ($this->isTimeless()) {
            return false;
        }

        $now = new \DateTime('now');

        return $this->endAt ? $now >= $this->endAt : false;
    }

    public function getRemainingTime(): ?array
    {
        $now = new \DateTime();
        if ($this->isOpen()) {
            if ($this->endAt) {
                $time = $this->endAt->diff($now);
            } else {
                $time = $this->startAt ? $this->startAt->diff($now) : null;
            }

            if ($time) {
                return [
                    'days' => (int) $time->format('%a'),
                    'hours' => (int) $time->format('%h'),
                ];
            }
        }

        return null;
    }

    public function lastOneDay(): bool
    {
        if ($this->endAt && $this->startAt) {
            return $this->isSameDate($this->startAt, $this->endAt);
        }

        return false;
    }

    public function isOpen(): bool
    {
        $now = new \DateTime();

        if (null !== $this->startAt && null !== $this->endAt) {
            return $this->startAt < $now && $this->endAt > $now;
        }

        if ($this->isTimeless()) {
            return true;
        }

        return false;
    }

    public function isClosed(): bool
    {
        $now = new \DateTime();

        if (null === $this->startAt && null === $this->endAt) {
            return !$this->isTimeless();
        }

        if (null === $this->endAt) {
            return null !== $this->startAt && $this->startAt < $now;
        }

        if ($this->endAt < $now) {
            return null === $this->startAt || $this->startAt < $now;
        }

        return false;
    }

    public function isFuture(): bool
    {
        $now = new \DateTime();

        if (null === $this->startAt) {
            return null !== $this->endAt && $this->endAt > $now;
        }
        if ($this->startAt > $now) {
            return null === $this->endAt || $this->endAt > $now;
        }

        return false;
    }

    public function isTimeless(): bool
    {
        if (!property_exists($this, 'timeless')) {
            return false;
        }

        return $this->timeless;
    }
}
