<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface SelfLinkableInterface
{
  public function getLink();
  public function setLink(SelfLinkableInterface $link);
  public function getConnections();
  public function addConnection(SelfLinkableInterface $connection);
  public function removeConnection(SelfLinkableInterface $connection);
}
