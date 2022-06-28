<?php

namespace Capco\AppBundle\Model;

interface Publishable
{
    public function isPublished(): bool;

    public function getPublishedAt(): ?\DateTime;

    public function setPublishedAt(\DateTime $date);

    public function getPublishableUntil(): ?\DateTime;

    // A publishable must have an author
    public function getAuthor();

    // A publishable must have a participation step (can be null)
    public function getStep();
}
