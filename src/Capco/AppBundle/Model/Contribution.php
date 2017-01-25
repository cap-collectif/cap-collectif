<?php

namespace Capco\AppBundle\Model;

interface Contribution extends CreatableInterface, ExpirableInterface, IndexableInterface
{
    public function getKind(): string;

    public function getRelated();
}
