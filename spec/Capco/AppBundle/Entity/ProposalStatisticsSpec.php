<?php

declare(strict_types=1);

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalStatistics;
use PhpSpec\ObjectBehavior;

class ProposalStatisticsSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalStatistics::class);
    }

    public function it_is_initializable_with_a_first_number_of_messages_sent_to_author(): void
    {
        $this->beConstructedWith(1);
        $this->getNbrOfMessagesSentToAuthor()->shouldReturn(1);
    }

    public function it_should_be_possible_to_increment_number_of_messages_sent_to_author(): void
    {
        $this->beConstructedWith(1);
        $this->incrementNbrOfMessagesSentToAuthor();
        $this->getNbrOfMessagesSentToAuthor()->shouldReturn(2);
        $this->incrementNbrOfMessagesSentToAuthor();
        $this->getNbrOfMessagesSentToAuthor()->shouldReturn(3);
    }

    public function it_should_be_possible_to_set_messages_sent_to_author(): void
    {
        $this->beConstructedWith(1);
        $this->setNbrOfMessagesSentToAuthor(5);
        $this->getNbrOfMessagesSentToAuthor()->shouldReturn(5);
    }

    public function it_should_be_possible_to_attach_a_proposal(
        Proposal $proposal
    ): void {
        $this->setProposal($proposal);
        $this->getProposal()->shouldReturn($proposal);
    }
}
