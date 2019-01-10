<?php
namespace Capco\AppBundle\Model;

interface Sourceable
{
    public function getSources();

    public function canContribute($user = null): bool;

    public function canDisplay($user = null): bool;

    public function isPublished(): bool;

    public function getOpinionType();

    public function incrementSourcesCount();
}
