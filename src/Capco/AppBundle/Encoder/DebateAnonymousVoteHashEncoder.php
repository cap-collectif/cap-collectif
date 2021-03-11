<?php

namespace Capco\AppBundle\Encoder;

use Capco\AppBundle\DTO\DebateAnonymousVoteHashData;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;

class DebateAnonymousVoteHashEncoder
{
    public function encode(DebateAnonymousVote $vote): string
    {
        return base64_encode(sprintf('%s:%s', $vote->getType(), $vote->getToken()));
    }

    public function decode(string $hash): DebateAnonymousVoteHashData
    {
        return DebateAnonymousVoteHashData::fromHash($hash);
    }
}
