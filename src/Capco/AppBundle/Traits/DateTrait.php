<?php

namespace Capco\AppBundle\Traits;

trait DateTrait
{
    public function isCreatedInLastInterval(\DateTime $to, \DateInterval $interval): bool
    {
        $diff = $this->createdAt->diff($to);

        return $diff < $interval;
    }

    public function isUpdatedInLastInterval(\DateTime $to, \DateInterval $interval): bool
    {
        $diff = $this->updatedAt->diff($to);

        return $diff < $interval;
    }

    public function isDeletedInLastInterval(\DateTime $to, \DateInterval $interval): bool
    {
        if ($this->isDeleted() && isset($this->deletedAt)) {
            $diff = $this->deletedAt->diff($to);

            return $diff < $interval;
        }

        return false;
    }
}
