<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\SmsOrderRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="sms_remaining_credit_email_alert")
 * @ORM\Entity(repositoryClass=SmsOrderRepository::class)
 */
class SmsRemainingCreditEmailAlert
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="status", type="string")
     */
    private string $status;

    /**
     * @ORM\ManyToOne(targetEntity=SmsCredit::class)
     * @ORM\JoinColumn(nullable=false, referencedColumnName="id", name="sms_credit_id")
     */
    private SmsCredit $smsCredit;

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getSmsCredit(): ?SmsCredit
    {
        return $this->smsCredit;
    }

    public function setSmsCredit(SmsCredit $smsCredit): self
    {
        $this->smsCredit = $smsCredit;

        return $this;
    }
}
