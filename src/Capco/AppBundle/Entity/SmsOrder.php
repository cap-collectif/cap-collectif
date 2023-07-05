<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\SmsOrderRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="sms_order")
 * @ORM\Entity(repositoryClass=SmsOrderRepository::class)
 */
class SmsOrder
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="amount", type="integer")
     */
    private int $amount;

    /**
     * @ORM\Column(name="is_processed", type="boolean", options={"default": false})
     */
    private bool $isProcessed = false;

    public function getAmount(): int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): self
    {
        $this->amount = $amount;

        return $this;
    }

    public function isProcessed(): bool
    {
        return $this->isProcessed;
    }

    public function setIsProcessed(bool $isProcessed): self
    {
        $this->isProcessed = $isProcessed;

        return $this;
    }
}
