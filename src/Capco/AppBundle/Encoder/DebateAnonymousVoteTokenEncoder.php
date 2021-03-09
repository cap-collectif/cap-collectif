<?php

namespace Capco\AppBundle\Encoder;

use Capco\AppBundle\DTO\DebateAnonymousVoteEncoderData;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;

class DebateAnonymousVoteTokenEncoder
{
    public function encode(DebateAnonymousVote $vote): string
    {
        return base64_encode(sprintf('%s:%s', $vote->getType(), $vote->getToken()));
    }

    public function decode(string $hash): DebateAnonymousVoteEncoderData
    {
        return DebateAnonymousVoteEncoderData::fromHash($hash);
    }
}
