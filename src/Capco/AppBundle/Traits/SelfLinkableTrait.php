<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Interfaces\SelfLinkableInterface;

trait SelfLinkableTrait
{
    protected $link;        // relations are added dynamically
    protected $connections; // add new ArrayCollection() in the constructor of the class using the trait

    /**
     * @ORM\Column(name="connections_count", type="integer")
     */
    protected $connectionsCount = 0;

    public function getLink()
    {
        return $this->link;
    }

    public function setLink(SelfLinkableInterface $link)
    {
        $this->link = $link;
        $link->addConnection($this);

        return $this;
    }

    public function getConnections()
    {
        return $this->connections;
    }

    public function setConnections($connections)
    {
        $this->connections = $connections;

        return $this;
    }

    public function addConnection(SelfLinkableInterface $connection)
    {
        if (!$this->connections->contains($connection)) {
            $this->connections->add($connection);
        }

        return $this;
    }

    public function removeConnection(SelfLinkableInterface $connection)
    {
        $this->connections->removeElement($connection);

        return $this;
    }

    /**
     * @return mixed
     */
    public function getConnectionsCount()
    {
        return $this->connectionsCount;
    }

    /**
     * @param mixed $connectionsCount
     */
    public function setConnectionsCount($connectionsCount)
    {
        $this->connectionsCount = $connectionsCount;

        return $this;
    }
}
