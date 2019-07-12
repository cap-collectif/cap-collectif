<?php

namespace Capco\AppBundle\Model;

interface Sourceable
{
    public function getSources();

    public function canContribute($user = null): bool;

    /**
     * @deprecated: please consider using `viewerCanSee` instead.
     */
    public function canDisplay($user = null): bool;

    public function isPublished(): bool;

    public function getOpinionType();

    public function incrementSourcesCount();

    public function getStep();
}
