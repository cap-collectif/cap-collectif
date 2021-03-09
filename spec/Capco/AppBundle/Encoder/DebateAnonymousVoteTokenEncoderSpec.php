<?php

namespace spec\Capco\AppBundle\Encoder;

use Capco\AppBundle\Encoder\DebateAnonymousVoteTokenEncoder;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use PhpSpec\ObjectBehavior;

class DebateAnonymousVoteTokenEncoderSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateAnonymousVoteTokenEncoder::class);
    }

    public function it_should_correctly_encode_anonymous_vote(DebateAnonymousVote $vote)
    {
        $vote->getType()->willReturn('FOR');
        $vote->getToken()->willReturn('supertoken');
        $this->encode($vote)->shouldBe('Rk9SOnN1cGVydG9rZW4=');
    }

    public function it_should_correctly_decode_hash()
    {
        $data = $this->decode('Rk9SOnN1cGVydG9rZW4=');
        $data->getType()->shouldBe('FOR');
        $data->getToken()->shouldBe('supertoken');
    }
}
