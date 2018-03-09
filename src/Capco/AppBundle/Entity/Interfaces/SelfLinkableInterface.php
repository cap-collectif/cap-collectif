<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface SelfLinkableInterface
{
    public function getConnections();

    public function getChildConnections();

    public function addChildConnection(self $childConnection);

    public function removeChildConnection(self $childConnection);

    public function getParentConnections();

    public function addParentConnection(self $parentConnection);

    public function removeParentConnection(self $parentConnection);
}
