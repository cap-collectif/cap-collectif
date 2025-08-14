<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Reply;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class CapcoAnonReplyDecoder
{
    /**
     * @return array<array<string, array{'token': string, 'replyId': string}>>
     *                                                                         return the decoded cookie with base64 IDs converted to database id
     */
    public function decode(string $anonReplyBase64): array
    {
        $questionnaireIds = json_decode(base64_decode($anonReplyBase64), true) ?? [];

        $decodedCookie = [];
        foreach ($questionnaireIds as $questionnaireBase64Id => $replies) {
            $questionnaireId = GlobalId::fromGlobalId($questionnaireBase64Id)['id'] ?? '';
            if (!$questionnaireId) {
                continue;
            }
            $decodedCookie[$questionnaireId] = $this->decodeReplies($replies);
        }

        return $decodedCookie;
    }

    /**
     * @param array<Reply> $replies
     *
     * @return array<array{'token': string, 'replyId': string}>
     */
    private function decodeReplies(array $replies): array
    {
        return array_map(fn ($reply) => [
            'token' => $reply['token'],
            'replyId' => GlobalId::fromGlobalId($reply['replyId'])['id'],
        ], $replies);
    }
}
