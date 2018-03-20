<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface SelfLinkableInterface
{
    public function getConnections();

    public function getChildConnections();

    public function addChildConnection(SelfLinkableInterface $childConnection);

    public function removeChildConnection(SelfLinkableInterface $childConnection);

    public function getParentConnections();

    public function addParentConnection(SelfLinkableInterface $parentConnection);

    public function removeParentConnection(SelfLinkableInterface $parentConnection);
}
