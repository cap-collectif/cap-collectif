<?php
namespace Capco\AppBundle\Entity\Interfaces;

interface Trashable
{
    public const STATUS_VISIBLE = 'visible';
    public const STATUS_INVISIBLE = 'invisible';

    public function isTrashed(): bool;

    public function getTrashedAt(): ?\DateTime;

    public function getTrashedReason(): ?string;

    public function isTrashedInLastInterval(\DateTime $to, \DateInterval $interval): bool;
}
