<?php

namespace Capco\AppBundle\Model;

interface VoteContribution extends CreatableInterface, ExpirableInterface
{
    public function getKind(): string;

    public function getRelated();
}
