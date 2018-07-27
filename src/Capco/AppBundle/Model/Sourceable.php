<?php
namespace Capco\AppBundle\Model;

interface Sourceable
{
    public function getSources();

    public function canContribute(): bool;

    public function canDisplay($user = null): bool;

    public function getOpinionType();

    public function incrementSourcesCount();
}
