<?php
namespace Capco\AppBundle\GraphQL\Resolver\Publishable;

use Capco\AppBundle\Model\Publishable;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class PublishableNotPublishedReasonResolver implements ResolverInterface
{
    public function __invoke(Publishable $publishable): ?string
    {
        if ($publishable->isPublished()) {
            return null;
        }
        $author = $publishable->getAuthor();
        if ($author->isEmailConfirmed()) {
            return "ACCOUNT_CONFIRMED_TOO_LATE";
        }
        $step = $publishable->getStep();
        if ($step->isOpen()) {
            return 'WAITING_AUTHOR_CONFIRMATION';
        }
        return "AUTHOR_NOT_CONFIRMED";
    }
}
