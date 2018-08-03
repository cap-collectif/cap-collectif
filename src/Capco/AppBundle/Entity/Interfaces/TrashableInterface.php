<?php
namespace Capco\AppBundle\Entity\Interfaces;

interface TrashableInterface
{
    public const STATUS_VISIBLE = 'visible';
    public const STATUS_INVISIBLE = 'invisible';

    public function isTrashed(): bool;

    public function getTrashedAt(): ?\DateTime;

    public function getTrashedReason(): ?string;
}
