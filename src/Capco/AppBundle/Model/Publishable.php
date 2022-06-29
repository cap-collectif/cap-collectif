<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Entity\Interfaces\Authorable;

interface Publishable extends Authorable
{
    public function isPublished(): bool;

    public function getPublishedAt(): ?\DateTime;

    public function setPublishedAt(\DateTime $date);

    public function getPublishableUntil(): ?\DateTime;

    // A publishable must have a participation step (can be null)
    public function getStep();
}
