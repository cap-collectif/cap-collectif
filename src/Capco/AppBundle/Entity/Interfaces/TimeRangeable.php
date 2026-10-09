<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface TimeRangeable
{
    public function getStartAt(): ?\DateTime;

    public function setStartAt(?\DateTime $startAt = null);

    public function getEndAt(): ?\DateTime;

    public function setEndAt(?\DateTime $endAt = null);

    public function hasStarted(?\DateTime $now = null): bool;

    public function hasEnded(?\DateTime $now = null): bool;

    public function getRemainingTime(?\DateTime $now = null): ?array;

    public function lastOneDay(): bool;

    public function isOpen(): bool;

    public function isClosed(): bool;

    public function isFuture(): bool;

    public function isTimeless(): bool;
}
