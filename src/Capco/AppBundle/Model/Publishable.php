<?php
namespace Capco\AppBundle\Model;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Steps\AbstractStep;

interface Publishable
{
    public function isPublished(): bool;
    public function getPublishedAt(): ?\DateTime;
    public function setPublishedAt(\DateTime $date);

    // A publishable must have an author
    public function getAuthor();

    // A publishable must have a participation step (can be null)
    public function getStep();
}
