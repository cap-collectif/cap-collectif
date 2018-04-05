<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\Interfaces\TrashableInterface;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Model\CreatableInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ConsultationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public $project = null;

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

    public function getSectionAppendixId(OpinionTypeAppendixType $type)
    {
        return $type->getAppendixTypeId();
    }

    public function getSectionAppendixTitle(OpinionTypeAppendixType $type)
    {
        return $type->getAppendixTypeTitle();
    }

    public function getConsultationContributionsConnection(ConsultationStep $consultation, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($consultation, $args) {
            $repo = $this->container->get('capco.opinion.repository');
            $criteria = [
              'step' => $consultation,
              'trashed' => false,
            ];
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];

            $orderBy = [$field => $direction];

            return $repo->getByCriteriaOrdered($criteria, $orderBy, null, $offset)->getIterator()->getArrayCopy();
        });

        $totalCount = $consultation->getOpinionCount();

        return $paginator->auto($args, $totalCount);
    }

    public function getSectionContributionsConnection(OpinionType $section, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($section, $args) {
            $repo = $this->container->get('capco.opinion.repository');
            $criteria = [
              'section' => $section,
              'trashed' => false,
            ];
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];

            return $repo->getByCriteriaOrdered($criteria, $orderBy, null, $offset)->getIterator()->getArrayCopy();
        });

        $totalCount = $section->getOpinions()->count();

        return $paginator->auto($args, $totalCount);
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
        $step = $this->container->get('capco.consultation_step.repository')
          ->getByOpinionId($contribution->getId())
        ;
        $project = $step->getProject();

        return $this->container->get('router')->generate(
            'app_consultation_show_opinion',
            [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
                'opinionTypeSlug' => $contribution->getOpinionType()->getSlug(),
                'opinionSlug' => $contribution->getSlug(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function getSectionChildren(OpinionType $type, Arg $argument)
    {
        $iterator = $type->getChildren()->getIterator();

        // define ordering closure, using preferred comparison method/field
        $iterator->uasort(function ($first, $second) {
            return (int) $first->getPosition() > (int) $second->getPosition() ? 1 : -1;
        });

        return $iterator;
    }

    public function getContributionsBySection(Arg $arg)
    {
        $typeId = $arg->offsetGet('sectionId');
        $type = $this->container->get('capco.opinion_type.repository')->find($typeId);

        return $this->getSectionOpinions($type, $arg);
    }

    public function getSectionUrl(OpinionType $type)
    {
        $step = $type->getStep();
        $project = $step->getProject();

        return $this->container->get('router')->generate(
          'app_consultation_show_opinions',
          [
              'projectSlug' => $project->getSlug(),
              'stepSlug' => $step->getSlug(),
              'opinionTypeSlug' => $type->getSlug(),
          ],
          UrlGeneratorInterface::ABSOLUTE_URL
      ) . '/1';
    }

    public function getSectionOpinions(OpinionType $type, Arg $arg)
    {
        $limit = $arg->offsetGet('limit');

        if (0 === $type->getOpinions()->count()) {
            return [];
        }

        $opinionRepo = $this->container->get('capco.opinion.repository');
        $opinions = $opinionRepo->getByOpinionTypeOrdered(
              $type->getId(),
              $limit,
              1,
              $type->getDefaultFilter()
          )
        ;

        return $opinions;
    }

    public function getSectionOpinionsCount(OpinionType $type): int
    {
        $repo = $this->container->get('capco.opinion.repository');

        return $repo->countByOpinionType($type->getId());
    }

    public function resolveConsultationSections(ConsultationStep $consultation, Arg $argument)
    {
        $sections = $consultation->getConsultationStepType()->getOpinionTypes();

        $iterator = $sections->filter(
            function (OpinionType $section) {
                return null === $section->getParent();
            }
        )->getIterator();

        // define ordering closure, using preferred comparison method/field
        $iterator->uasort(function ($first, $second) {
            return (int) $first->getPosition() > (int) $second->getPosition() ? 1 : -1;
        });

        return $iterator;
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
            return $this->resolvePropositionUrl($parent) . '#arg-' . $argument->getId();
        } elseif ($parent instanceof OpinionVersion) {
            return $this->resolveVersionUrl($parent) . '#arg-' . $argument->getId();
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
            ->createQuery('SELECT PARTIAL vote.{id, value, createdAt, expired}, PARTIAL author.{id}, PARTIAL opinion.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author LEFT JOIN vote.opinion opinion WHERE vote.opinion = \'' . $proposition->getId() . '\'')
            // ->setMaxResults(50)
            ->getArrayResult();
    }

    public function resolveVersionVotes(OpinionVersion $version, Arg $argument)
    {
        return $this->container->get('doctrine')->getManager()
            ->createQuery('SELECT PARTIAL vote.{id, value, createdAt, expired}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVersionVote vote LEFT JOIN vote.user author WHERE vote.opinionVersion = \'' . $version->getId() . '\'')
            // ->setMaxResults(50)
            ->getArrayResult();
    }

    public function resolveVotesByContribution(Arg $argument)
    {
        return $this->container->get('doctrine')->getManager()
            ->createQuery('SELECT PARTIAL vote.{id, value}, PARTIAL author.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author WHERE vote.opinion = \'' . $argument->offsetGet('contribution') . '\'')
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
