<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ConsultationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveConsultationIsContribuable(ConsultationStep $consultation): bool
    {
        return $consultation->canContribute();
    }

    public function resolve(Argument $args)
    {
        $repo = $this->container
        ->get('capco.consultation_step.repository');
        if (isset($args['id'])) {
            return [$repo->find($args['id'])];
        }

        return $repo->findAll();
    }

    public function resolvePropositionUrl(Opinion $contribution): string
    {
        return $this->container->get('router')->generate(
          'app_consultation_show_opinion',
          [
              'projectSlug' => $contribution->getStep()->getProject()->getSlug(),
              'stepSlug' => $contribution->getStep()->getSlug(),
              'opinionTypeSlug' => $contribution->getOpinionType()->getSlug(),
              'opinionSlug' => $contribution->getSlug(),
          ],
          UrlGeneratorInterface::ABSOLUTE_URL
      );
    }

    public function resolveConsultationSections(ConsultationStep $consultation)
    {
        return $consultation->getConsultationStepType()->getOpinionTypes();
    }

    public function resolvePropositionArguments(/*Opinion|OpinionVersion*/ $proposition, Argument $argument)
    {
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

    public function resolvePropositionVoteAuthor(array $vote)
    {
        return $vote['user'];
    }

    public function resolverPropositionVoteCreatedAt(array $vote): string
    {
        return $vote['createdAt']->format(\DateTime::ISO8601);
    }

    public function resolveTrashedAt($object)
    {
        return $object->getCreatedAt() ? $object->getCreatedAt()->format(\DateTime::ISO8601) : null;
    }

    public function resolveContributionVotesCount(/*Opinion|OpinionVersion*/ $opinion): int
    {
        return $opinion->getVotesCountAll();
    }

    public function resolveArgumentsCountFor(/*Opinion|OpinionVersion*/ $opinion)
    {
        return $opinion->getArgumentForCount();
    }

    public function resolveArgumentsCountAgainst(/*Opinion|OpinionVersion*/ $opinion)
    {
        return $opinion->getArgumentAgainstCount();
    }

    public function resolveReportingType($reporting): int
    {
        return $reporting->getStatus();
    }

    public function resolveReportingAuthor($reporting)
    {
        return $reporting->getReporter();
    }

    public function resolvePropositionReportings(Opinion $opinion)
    {
        return $this->container
                    ->get('capco.reporting.repository')
                    ->findBy(['Opinion' => $opinion])
        ;
    }

    public function resolveVersionReportings(OpinionVersion $version)
    {
        return $this->container
                    ->get('capco.reporting.repository')
                    ->findBy(['opinionVersion' => $version])
        ;
    }

    public function resolveArgumentUrl($argument): string
    {
        $parent = $argument->getParent();
        if ($parent instanceof Opinion) {
            return $this->resolvePropositionUrl($parent).'#arg-'.$argument->getId();
        } elseif ($parent instanceof OpinionVersion) {
            return $this->resolveVersionUrl($parent).'#arg-'.$argument->getId();
        }

        return '';
    }

    public function resolveVersionUrl($version): string
    {
        $opinion = $version->getParent();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $project = $step->getProject();

        return $this->container->get('router')->generate(
          'app_project_show_opinion_version',
          [
              'projectSlug' => $project->getSlug(),
              'stepSlug' => $step->getSlug(),
              'opinionTypeSlug' => $opinionType->getSlug(),
              'opinionSlug' => $opinion->getSlug(),
              'versionSlug' => $version->getSlug(),
          ],
          UrlGeneratorInterface::ABSOLUTE_URL
      );
    }

    public function resolveCreatedAt($object): string
    {
        return $object->getCreatedAt()->format(\DateTime::ISO8601);
    }

    public function resolveUpdatedAt($object): string
    {
        return $object->getUpdatedAt()->format(\DateTime::ISO8601);
    }

    public function resolvePropositionVotes(Opinion $proposition, Argument $argument)
    {
        return $this->container->get('doctrine')->getEntityManager()
        ->createQuery('SELECT PARTIAL vote.{id, value, createdAt, expired}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author WHERE vote.opinion = '.$proposition->getId())
        // ->setMaxResults(50)
        ->getArrayResult()
      ;
    }

    public function resolveVersionVotes(OpinionVersion $version, Argument $argument)
    {
        return $this->container->get('doctrine')->getEntityManager()
        ->createQuery('SELECT PARTIAL vote.{id, value, createdAt, expired}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVersionVote vote LEFT JOIN vote.user author WHERE vote.opinionVersion = '.$version->getId())
        // ->setMaxResults(50)
        ->getArrayResult()
      ;
    }

    public function resolveVotesByContribution(Argument $argument)
    {
        return $this->container->get('doctrine')->getEntityManager()
      ->createQuery('SELECT PARTIAL vote.{id, value}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author WHERE vote.opinion = '.$argument->offsetGet('contribution'))
      ->getArrayResult()
      ;
    }

    public function resolveContributionsByConsultation(Argument $argument)
    {
        return $this->container
        ->get('capco.opinion.repository')->findBy([
          'step' => $argument->offsetGet('consultation'),
        ]);
    }

    public function resolveContributions(ConsultationStep $consultation)
    {
        return $this->container
        ->get('capco.opinion.repository')->findBy([
          'step' => $consultation->getId(),
        ]);
    }
}
