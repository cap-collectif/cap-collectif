<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ProposalResolver implements ContainerAwareInterface
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

    public function resolve(Arg $args): Proposal
    {
        $repo = $this->container->get('capco.proposal.repository');

        return $repo->find($args['id']);
    }

    public function resolveProposalPublicationStatus(Proposal $proposal): string
    {
        if ($proposal->isExpired()) {
            return 'EXPIRED';
        }
        if ($proposal->isTrashed()) {
            return 'TRASHED';
        }

        return 'PUBLISHED';
    }

    public function resolveProposalUrl(Proposal $proposal): string
    {
        // $step = $this->container->get('capco.consultation_step.repository')
        //   ->getByOpinionId($contribution->getId())
        // ;
        // $project = $step->getProject();
        //
        // return $this->container->get('router')->generate(
        //     'app_consultation_show_opinion',
        //     [
        //         'projectSlug' => $project->getSlug(),
        //         'stepSlug' => $step->getSlug(),
        //         'opinionTypeSlug' => $contribution->getOpinionType()->getSlug(),
        //         'opinionSlug' => $contribution->getSlug(),
        //     ],
        //     UrlGeneratorInterface::ABSOLUTE_URL
        // );
    }
}
