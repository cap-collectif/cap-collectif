<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\Interfaces\TrashableInterface;
use Capco\AppBundle\Model\CreatableInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ConsultationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveContributionType($data)
    {
        $typeResolver = $this->container->get('overblog_graphql.type_resolver');
        if ($data instanceof Opinion) {
            return $typeResolver->resolve('Opinion');
        }
        if ($data instanceof OpinionVersion) {
            return $typeResolver->resolve('Version');
        }
        if ($data instanceof Argument) {
            return $typeResolver->resolve('Argument');
        }
        if ($data instanceof Source) {
            return $typeResolver->resolve('Source');
        }
        if ($data instanceof Reporting) {
            return $typeResolver->resolve('Reporting');
        }

        throw new UserError('Could not resolve type of Contribution.');
    }

    public function resolveConsultationIsContribuable(ConsultationStep $consultation): bool
    {
        return $consultation->canContribute();
    }

    public function resolve(Arg $args)
    {
        $repo = $this->container->get('capco.consultation_step.repository');
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

    public function resolvePropositionArguments(OpinionContributionInterface $proposition, Arg $argument)
    {
        if ($argument->offsetExists('type')) {
            return $proposition->getArguments()->filter(
                function ($a) use ($argument) {
                    return $a->getType() === $argument->offsetGet('type');
                }
            );
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

    public function resolvePropositionVoteProposition(array $vote)
    {
        if (isset($vote['opinion'])) {
            return $this->container
              ->get('capco.opinion.repository')
              ->find($vote['opinion'])
            ;
        }

        return null;
    }

    public function resolverPropositionVoteCreatedAt(array $vote): string
    {
        return $vote['createdAt']->format(\DateTime::ATOM);
    }

    public function resolveTrashedAt(TrashableInterface $object)
    {
        return $object->getTrashedAt() ? $object->getTrashedAt()->format(\DateTime::ATOM) : null;
    }

    public function resolveContributionVotesCount(OpinionContributionInterface $opinion): int
    {
        return $opinion->getVotesCountAll();
    }

    public function resolveArgumentsCountFor(OpinionContributionInterface $opinion)
    {
        return $opinion->getArgumentForCount();
    }

    public function resolveArgumentsCountAgainst(OpinionContributionInterface $opinion)
    {
        return $opinion->getArgumentAgainstCount();
    }

    public function resolveReportingType(Reporting $reporting): int
    {
        return $reporting->getStatus();
    }

    public function resolveReportingAuthor(Reporting $reporting)
    {
        return $reporting->getReporter();
    }

    public function resolvePropositionReportings(Opinion $opinion)
    {
        return $this->container
            ->get('capco.reporting.repository')
            ->findBy(['Opinion' => $opinion]);
    }

    public function resolveVersionReportings(OpinionVersion $version)
    {
        return $this->container
            ->get('capco.reporting.repository')
            ->findBy(['opinionVersion' => $version]);
    }

    public function resolveArgumentUrl(Argument $argument): string
    {
        $parent = $argument->getParent();
        if ($parent instanceof Opinion) {
            return $this->resolvePropositionUrl($parent).'#arg-'.$argument->getId();
        } elseif ($parent instanceof OpinionVersion) {
            return $this->resolveVersionUrl($parent).'#arg-'.$argument->getId();
        }

        return '';
    }

    public function resolveVersionUrl(OpinionVersion $version): string
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

    public function resolveCreatedAt(CreatableInterface $object): string
    {
        return $object->getCreatedAt()->format(\DateTime::ATOM);
    }

    public function resolveUpdatedAt($object): string
    {
        return $object->getUpdatedAt()->format(\DateTime::ATOM);
    }

    public function resolvePropositionVotes(Opinion $proposition, Arg $argument)
    {
        return $this->container->get('doctrine')->getManager()
            ->createQuery(
                'SELECT PARTIAL vote.{id, value, createdAt, expired}, PARTIAL author.{id}, PARTIAL opinion.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author LEFT JOIN vote.opinion opinion WHERE vote.opinion = '.$proposition->getId(
                )
            )
            // ->setMaxResults(50)
            ->getArrayResult();
    }

    public function resolveVersionVotes(OpinionVersion $version, Arg $argument)
    {
        return $this->container->get('doctrine')->getManager()
            ->createQuery(
                'SELECT PARTIAL vote.{id, value, createdAt, expired}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVersionVote vote LEFT JOIN vote.user author WHERE vote.opinionVersion = '.$version->getId(
                )
            )
            // ->setMaxResults(50)
            ->getArrayResult();
    }

    public function resolveVotesByContribution(Arg $argument)
    {
        return $this->container->get('doctrine')->getManager()
            ->createQuery(
                'SELECT PARTIAL vote.{id, value}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author WHERE vote.opinion = '.$argument->offsetGet(
                    'contribution'
                )
            )
            ->getArrayResult();
    }

    public function resolveContributionsByConsultation(Arg $argument)
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
