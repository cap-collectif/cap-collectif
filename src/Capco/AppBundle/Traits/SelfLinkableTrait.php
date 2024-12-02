<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Interfaces\SelfLinkableInterface;
use Doctrine\ORM\Mapping as ORM;

trait SelfLinkableTrait
{
    protected $childConnections; // add new ArrayCollection() in the constructor of the class using the trait
    protected $parentConnections; // add new ArrayCollection() in the constructor of the class using the trait

    /**
     * @ORM\Column(name="connections_count", type="integer")
     */
    protected $connectionsCount = 0;

    public function getChildConnections()
    {
        return $this->childConnections;
    }

    public function setChildConnections($childConnections)
    {
        $this->childConnections = $childConnections;

        return $this;
    }

    public function addChildConnection(SelfLinkableInterface $childConnection)
    {
        if (!$this->childConnections->contains($childConnection)) {
            $this->childConnections->add($childConnection);
            ++$this->connectionsCount;
        }

        return $this;
    }

    public function removeChildConnection(SelfLinkableInterface $childConnection)
    {
        $this->childConnections->removeElement($childConnection);
        --$this->connectionsCount;

        return $this;
    }

    public function getParentConnections()
    {
        return $this->parentConnections;
    }

    public function setParentConnections($parentConnections)
    {
        $this->parentConnections = $parentConnections;
        foreach ($parentConnections as $pc) {
            $pc->addChildConnection($this);
        }

        return $this;
    }

    public function addParentConnection(?SelfLinkableInterface $parentConnection = null)
    {
        if ($parentConnection && !$this->parentConnections->contains($parentConnection)) {
            $this->parentConnections->add($parentConnection);
            $parentConnection->addChildConnection($this);
            ++$this->connectionsCount;
        }

        return $this;
    }

    public function removeParentConnection(SelfLinkableInterface $parentConnection)
    {
        $this->parentConnections->removeElement($parentConnection);
        $parentConnection->removeChildConnection($this);
        --$this->connectionsCount;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getConnectionsCount()
    {
        return $this->connectionsCount;
    }

    public function setConnectionsCount(mixed $connectionsCount)
    {
        $this->connectionsCount = $connectionsCount;

        return $this;
    }

    public function getConnections()
    {
        return array_merge($this->childConnections->toArray(), $this->parentConnections->toArray());
    }
}
