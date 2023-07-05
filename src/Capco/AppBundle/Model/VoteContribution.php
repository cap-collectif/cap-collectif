<?php

namespace Capco\AppBundle\Model;

interface VoteContribution extends CreatableInterface
{
    public function getKind(): string;

    public function getRelated();
}
