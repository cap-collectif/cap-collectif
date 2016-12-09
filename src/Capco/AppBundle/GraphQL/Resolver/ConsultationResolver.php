<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\GraphQLBundle\Definition\Argument;

class ConsultationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve($args)
    {
        $repo = $this->container
        ->get('capco.consultation_step.repository');
        if (isset($args['id'])) {
          return [$repo->find($args['id'])];
        }
        return $repo->findAll();
    }

    public function resolvePropositionUrl(Opinion $contribution)
    {
      return $this->container->get('router')->generate(
          'app_consultation_show_opinion',
          [
              'projectSlug' => $contribution->getStep()->getProject()->getSlug(),
              'stepSlug' => $contribution->getStep()->getSlug(),
              'opinionTypeSlug' => $contribution->getOpinionType()->getSlug(),
              'opinionSlug' => $contribution->getSlug(),
          ],
          true
      );
    }

    public function resolveConsultationSections(ConsultationStep $consultation)
    {
      return $consultation->getConsultationStepType()->getOpinionTypes();
    }

    public function resolvePropositionArguments(Opinion $proposition, Argument $argument) {
        if ($argument->offsetExists('type')) {
          return $proposition->getArguments()->filter(function ($a) use ($argument) {
              return $a->getType() === $argument->offsetGet('type');
          });
        }
        return $proposition->getArguments();
    }

    public function resolvePropositionSection(Opinion $proposition)
    {
      return $proposition->getOpinionType();
    }

    public function resolvePropositionVoteAuthor($vote)
    {
        return $vote['user'];
    }

    public function resolvePropositionVotes(Opinion $proposition, Argument $argument)
    {
      return $this->container->get('doctrine')->getEntityManager()
      ->createQuery('SELECT PARTIAL vote.{id, value}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author WHERE vote.opinion = ' . $proposition->getId())
      ->setMaxResults(200)
      ->getArrayResult()
      ;
    }

    public function resolveVotesByContribution(Argument $argument)
    {
      return $this->container->get('doctrine')->getEntityManager()
      ->createQuery('SELECT PARTIAL vote.{id, value}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author WHERE vote.opinion = ' . $argument->offsetGet('contribution'))
      ->getArrayResult()
      ;
    }

    public function resolveContributions(ConsultationStep $consultation)
    {
        return $this->container
        ->get('capco.opinion.repository')->findBy([
          'step' => $consultation->getId(),
        ]);
    }
}
