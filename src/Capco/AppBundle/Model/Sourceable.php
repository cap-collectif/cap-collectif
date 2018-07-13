<?php
namespace Capco\AppBundle\Model;

interface Sourceable
{
    public function getSources();

    public function canContribute(): bool;

    public function canDisplay(): bool;

    public function isPublished(): bool;

    public function getOpinionType();

    public function incrementSourcesCount();
}
