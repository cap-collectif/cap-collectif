<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Enum\EmailingCampaignStatus;
use Capco\AppBundle\Mailer\Enum\EmailingCampaignInternalList;
use PhpSpec\ObjectBehavior;

class EmailingCampaignSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(EmailingCampaign::class);
    }

    public function it_is_editable()
    {
        $this->setStatus(EmailingCampaignStatus::DRAFT);
        $this->isEditable()->shouldBe(true);

        $this->setStatus(EmailingCampaignStatus::PLANNED);
        $this->isEditable()->shouldBe(true);

        $this->setStatus(EmailingCampaignStatus::SENT);
        $this->isEditable()->shouldBe(false);

        $this->setStatus(EmailingCampaignStatus::ARCHIVED);
        $this->isEditable()->shouldBe(false);
    }

    public function has_receipt()
    {
        $this->setMailingList(null);
        $this->setMailingInternal(null);
        $this->hasReceipt()->shouldBe(false);

        $this->setMailingInternal(EmailingCampaignInternalList::REGISTERED);
        $this->hasReceipt()->shouldBe(true);
        $this->setMailingInternal(null);

        $this->setMailingList(new MailingList());
        $this->hasReceipt()->shouldBe(true);
    }

    public function is_complete()
    {
        $this->isComplete()->shouldBe(false);

        $this->setSenderEmail('dev@capco.com');
        $this->isComplete()->shouldBe(false);

        $this->setSenderName('les devs de capco');
        $this->isComplete()->shouldBe(false);

        $this->setObject('salut !');
        $this->isComplete()->shouldBe(false);

        $this->setContent("c'était pour dire bonjour");
        $this->isComplete()->shouldBe(true);
    }

    public function can_be_sent()
    {
        $this->canBeSent()->shouldBe(false);

        $this->setStatus(EmailingCampaignStatus::DRAFT);
        $this->isEditable()->shouldBe(true);
        $this->canBeSent()->shouldBe(false);

        $this->setSenderEmail('dev@capco.com');
        $this->setSenderName('les devs de capco');
        $this->setObject('salut !');
        $this->setContent("c'était pour dire bonjour");
        $this->isComplete()->shouldBe(true);
        $this->canBeSent()->shouldBe(false);

        $this->setMailingInternal(EmailingCampaignInternalList::REGISTERED);
        $this->hasReceipt()->shouldBe(true);
        $this->canBeSent()->shouldBe(true);
    }
}
