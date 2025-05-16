<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * @ORM\Table(name="sms_credit")
 * @UniqueEntity(
 *   fields={"smsOrder"}
 * )
 * @ORM\Entity(repositoryClass=SmsCreditRepository::class)
 */
class SmsCredit implements EntityInterface
{
    use TimestampableTrait;
    use UuidTrait;

    final public const RELAY_NODE_TYPE = 'SmsCredit';

    /**
     * @ORM\Column(name="amount", type="integer")
     */
    private int $amount;

    /**
     * @ORM\ManyToOne(targetEntity=SmsOrder::class)
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id", name="sms_order_id", unique=true)
     */
    private SmsOrder $smsOrder;

    public function getAmount(): int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): self
    {
        $this->amount = $amount;

        return $this;
    }

    public function getSmsOrder(): SmsOrder
    {
        return $this->smsOrder;
    }

    public function setSmsOrder(SmsOrder $smsOrder): self
    {
        $this->smsOrder = $smsOrder;

        return $this;
    }
}
