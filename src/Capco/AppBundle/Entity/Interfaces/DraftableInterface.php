<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface DraftableInterface
{
    public function isDraft(): bool;

    public function setDraft(bool $draft);
}
