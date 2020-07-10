<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class VoteExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('capco_vote_object_url', [VoteRuntime::class, 'getRelatedObjectUrl']),
            new TwigFunction('capco_vote_object', [VoteRuntime::class, 'getRelatedObject']),
            new TwigFunction('capco_vote_object_admin_url', [
                VoteRuntime::class,
                'getRelatedObjectAdminUrl',
            ]),
            new TwigFunction('capco_has_votable_step_not_future', [
                VoteRuntime::class,
                'hasVotableStepNotFuture',
            ]),
        ];
    }
}
