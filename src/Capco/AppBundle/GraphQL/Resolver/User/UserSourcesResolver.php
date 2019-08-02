<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use ArrayObject;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\Security\Core\User\UserInterface;

class UserSourcesResolver implements ResolverInterface
{
    protected $sourceRepository;

    public function __construct(SourceRepository $sourceRepository)
    {
        $this->sourceRepository = $sourceRepository;
    }

    public function __invoke(
        $viewer,
        User $user,
        Argument $args = null,
        ?ArrayObject $context = null
    ): Connection {
        if (!$args) {
            $args = new Argument(['first' => 5]);
        }

        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        if ($aclDisabled) {
            $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
                return $this->sourceRepository->findAllByAuthor($user, $offset, $limit);
            });

            $totalCount = $this->sourceRepository->countAllByAuthor($user);
        } elseif ($validViewer && $user) {
            /** @var User $viewer */
            $paginator = new Paginator(function (int $offset, int $limit) use ($viewer, $user) {
                return $this->sourceRepository->getSourcesByAuthorViewerCanSee(
                    $viewer,
                    $user,
                    $limit,
                    $offset
                );
            });
            $totalCount = $this->sourceRepository->countSourcesByAuthorViewerCanSee($viewer, $user);
        } else {
            $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
                return $this->sourceRepository->getPublicSourcesByAuthor($user, $offset, $limit);
            });

            $totalCount = $this->sourceRepository->countPublicSourcesByAuthor($user);
        }

        return $paginator->auto($args, $totalCount);
    }
}
