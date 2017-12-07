<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Doctrine\Common\Collections\Collection;
use GraphQL\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalEvaluationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveResponseType(AbstractResponse $response)
    {
        $typeResolver = $this->container->get('overblog_graphql.type_resolver');

        if ($response instanceof MediaResponse) {
            return $typeResolver->resolve('MediaResponse');
        }

        if ($response instanceof ValueResponse) {
            return $typeResolver->resolve('ValueResponse');
        }

        throw new UserError('Could not resolve type of Response.');
    }

    public function resolveResponses(ProposalEvaluation $evaluation, $user): Collection
    {
        $isEvaluer = $this->container->get('capco.resolver.proposals')->resolveViewerIsEvaluer($evaluation->getProposal(), $user);
        $viewerCanSeePrivateResponses = $isEvaluer || ($user instanceof User && $user->isAdmin());

        return $evaluation->getResponses()->filter(
          function ($response) use ($viewerCanSeePrivateResponses) {
              return !$response->getQuestion()->isPrivate() || $viewerCanSeePrivateResponses;
          }
        );
    }
}
