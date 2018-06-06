<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserContributionResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(User $object, Argument $args): Connection
    {
        $query = $this->getContributionsByType($args->offsetGet('type'), $object);
        $paginator = new Paginator(function (int $offset, int $limit) use ($query) {
            return $query['values'];
        });

        return $paginator->auto($args, $query['totalCount']);
    }

    public function getContributionsByType(string $requestedType = null, User $user): array
    {
        $result = [];

        switch ($requestedType) {
            case 'Opinions':
                $result['values'] = $this->container->get('capco.opinion.repository')->findAllByAuthor($user);
                $result['totalCount'] = $this->container->get('capco.opinion.repository')->countAllByAuthor($user);

                return $result;
                break;
            case 'OpinionVersions':
                $result['values'] = $this->container->get('capco.opinion_version.repository')->findAllByAuthor($user);
                $result['totalCount'] = $this->container->get('capco.opinion_version.repository')->countAllByAuthor($user);

                return $result;
                break;
            case 'Comments':
                $result['values'] = $this->container->get('capco.comment.repository')->findAllByAuthor($user);
                $result['totalCount'] = $this->container->get('capco.comment.repository')->countAllByAuthor($user);

                return $result;
                break;
            case 'Arguments':
                $result['values'] = $this->container->get('capco.argument.repository')->findAllByAuthor($user);
                $result['totalCount'] = $this->container->get('capco.argument.repository')->countAllByAuthor($user);

                return $result;
                break;
            case 'Sources':
                $result['values'] = $this->container->get('capco.source.repository')->findAllByAuthor($user);
                $result['totalCount'] = $this->container->get('capco.source.repository')->countAllByAuthor($user);

                return $result;
                break;
            case 'Proposals':
                $result['values'] = $this->container->get('capco.proposal.repository')->findAllByAuthor($user);
                $result['totalCount'] = $this->container->get('capco.proposal.repository')->countAllByAuthor($user);

                return $result;
                break;
            case 'Replies':
                $result['values'] = $this->container->get('capco.reply.repository')->findAllByAuthor($user);
                $result['totalCount'] = $this->container->get('capco.reply.repository')->countAllByAuthor($user);

                return $result;
                break;
        }
    }
}
