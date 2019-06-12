<?php

namespace Capco\AppBundle\Entity\Interfaces;

/** is the entity Draftable ? A draft is an entity not published */
interface DraftableInterface
{
    public function isDraft(): bool;

    public function setDraft(bool $draft);
}
