<?php
namespace Capco\AppBundle\Model;

interface Publishable
{
    public function isPublished(): bool;
    public function getPublishedAt(): ?\DateTime;
    public function setPublishedAt(\DateTime $date);
}
