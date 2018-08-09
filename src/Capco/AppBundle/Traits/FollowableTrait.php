<?php
namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Follower;
use Doctrine\Common\Collections\Collection;

trait FollowableTrait
{
    public function getFollowers(): Collection
    {
        return $this->followers;
    }

    public function addFollower(Follower $follower): self
    {
        if (!$this->followers->contains($follower)) {
            $this->followers[] = $follower;
        }

        return $this;
    }

    public function removeFollower(Follower $follower): self
    {
        $this->followers->removeElement($follower);

        return $this;
    }

    public function setFollowers(Collection $followers): self
    {
        $this->followers = $followers;

        return $this;
    }

    public function hasFollowers(): bool
    {
        return !$this->followers->isEmpty();
    }

    public function countFollowers(): int
    {
        return $this->followers->count();
    }
}
