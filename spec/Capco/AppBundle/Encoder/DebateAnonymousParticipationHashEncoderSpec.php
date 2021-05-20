<?php

namespace spec\Capco\AppBundle\Encoder;

use Capco\AppBundle\Encoder\DebateAnonymousParticipationHashEncoder;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use PhpSpec\ObjectBehavior;

class DebateAnonymousParticipationHashEncoderSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(DebateAnonymousParticipationHashEncoder::class);
    }

    public function it_should_correctly_encode_anonymous_vote(DebateAnonymousVote $vote)
    {
        $vote->getType()->willReturn('FOR');
        $vote->getToken()->willReturn('supertoken');
        $this->encode($vote)->shouldBe('Rk9SOnN1cGVydG9rZW4=');
    }

    public function it_should_correctly_encode_anonymous_argument(DebateAnonymousArgument $argument)
    {
        $argument->getType()->willReturn('FOR');
        $argument->getToken()->willReturn('supertoken');
        $this->encode($argument)->shouldBe('Rk9SOnN1cGVydG9rZW4=');
    }

    public function it_should_correctly_decode_hash()
    {
        $data = $this->decode('Rk9SOnN1cGVydG9rZW4=');
        $data->getType()->shouldBe('FOR');
        $data->getToken()->shouldBe('supertoken');
    }
}
