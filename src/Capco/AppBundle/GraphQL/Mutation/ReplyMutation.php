<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ReplyMutation
{
    public const PHONE_ALREADY_USED = 'PHONE_ALREADY_USED';

    public function __construct(private readonly ValidatePhoneReusabilityMutation $validatePhoneReusabilityMutation)
    {
    }

    public function canReusePhone(Reply $reply, ?string $participantToken = null, ?User $viewer = null): bool
    {
        $response = $this->validatePhoneReusabilityMutation->__invoke(new Argument([
            'input' => [
                'participantToken' => $participantToken,
                'contributionId' => GlobalId::toGlobalId('Reply', $reply->getId()),
            ],
        ]), $viewer);

        $errorCode = $response['errorCode'] ?? null;

        if (self::PHONE_ALREADY_USED === $errorCode) {
            return false;
        }

        return true;
    }
}
