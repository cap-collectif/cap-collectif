<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\ProposalEvaluation;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalEvaluationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

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
