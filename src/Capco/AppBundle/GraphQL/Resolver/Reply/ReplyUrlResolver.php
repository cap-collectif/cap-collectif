<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ReplyUrlResolver implements QueryInterface
{
    public function __construct(private readonly UrlResolver $urlResolver)
    {
    }

    public function __invoke(Reply $reply): string
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep() ?? null;

        if (!$step) {
            return '/';
        }

        $replyIdBase64 = GlobalId::toGlobalId('Reply', $reply->getId());

        $url = $this->urlResolver->getStepUrl($step, true);

        return "{$url}/replies/{$replyIdBase64}";
    }
}
