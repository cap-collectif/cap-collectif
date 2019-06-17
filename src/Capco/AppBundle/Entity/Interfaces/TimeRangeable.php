<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface TimeRangeable
{
    public function getStartAt(): ?\DateTime;

    public function setStartAt(?\DateTime $startAt = null);

    public function getEndAt(): ?\DateTime;

    public function setEndAt(?\DateTime $endAt = null);
}
