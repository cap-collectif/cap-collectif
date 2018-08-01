<?php
namespace Capco\AppBundle\GraphQL\Resolver\Publishable;

use Capco\AppBundle\Entity\Reply;
use GraphQL\Type\Definition\Type;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Entity\OpinionVersion;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class PublishableTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(Publishable $node): Type
    {
        if ($node instanceof Opinion) {
            return $this->typeResolver->resolve('Opinion');
        }
        if ($node instanceof Proposal) {
            return $this->typeResolver->resolve('Proposal');
        }
        if ($node instanceof OpinionVersion) {
            return $this->typeResolver->resolve('Version');
        }
        if ($node instanceof Argument) {
            return $this->typeResolver->resolve('Argument');
        }
        if ($node instanceof Source) {
            return $this->typeResolver->resolve('Source');
        }
        if ($node instanceof Comment) {
            return $this->typeResolver->resolve('Comment');
        }

        throw new UserError('Could not resolve type of Publishable.');
    }
}
