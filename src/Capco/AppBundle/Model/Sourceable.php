<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Entity\OpinionType;
use Doctrine\Common\Collections\Collection;

interface Sourceable
{
    public function getSources(): Collection;

    public function canContribute($user = null): bool;

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     *
     * @param null|mixed $user
     */
    public function canDisplay($user = null): bool;

    public function isPublished(): bool;

    public function getOpinionType(): ?OpinionType;

    public function getStep();
}
