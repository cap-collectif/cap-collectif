<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Repository\ConsultationStepRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Answer;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\OpinionVersion;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Model\CreatableInterface;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;

class ConsultationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public $project;

    public function resolveContributionType($data)
    {
        $typeResolver = $this->container->get('overblog_graphql.type_resolver');
        $currentSchemaName = $typeResolver->getCurrentSchemaName();

        if ($data instanceof Opinion) {
            return $typeResolver->resolve('Opinion');
        }
        if ($data instanceof OpinionVote) {
            return $typeResolver->resolve('OpinionVote');
        }
        if ($data instanceof OpinionVersion) {
            return $typeResolver->resolve('Version');
        }
        if ($data instanceof OpinionVersionVote) {
            return $typeResolver->resolve('VersionVote');
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
        if ($data instanceof Comment) {
            return $typeResolver->resolve('Comment');
        }
        if ($data instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $typeResolver->resolve('PreviewProposal');
            }

            return $typeResolver->resolve('InternalProposal');
        }
        if ($data instanceof Reply) {
            return $typeResolver->resolve('Reply');
        }
        if ($data instanceof Answer) {
            return $typeResolver->resolve('Answer');
        }
        if ($data instanceof Post) {
            return $typeResolver->resolve('Post');
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

    public function getSectionAppendixHelpText(OpinionTypeAppendixType $type)
    {
        return $type->getAppendixTypeHelpText();
    }

    public function getSectionContributionsConnection(OpinionType $section, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($section, $args) {
            $repo = $this->container->get(OpinionRepository::class);
            $criteria = ['section' => $section, 'trashed' => false];
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];

            return $repo
                ->getByCriteriaOrdered($criteria, $orderBy, null, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $section->getOpinions()->count();

        return $paginator->auto($args, $totalCount);
    }

    public function resolve(Arg $args)
    {
        $repo = $this->container->get(ConsultationStepRepository::class);
        if (isset($args['id'])) {
            $stepId = GlobalId::fromGlobalId($args['id'])['id'];
            $consultation = $repo->find($stepId);

            return [$consultation];
        }

        return $repo->findAll();
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

    public function getSectionOpinionsCount(OpinionType $type): int
    {
        $repo = $this->container->get(OpinionRepository::class);

        return $repo->countByOpinionType($type->getId());
    }

    public function resolveConsultationSections(
        ConsultationStep $consultation,
        Arg $argument
    ): \Traversable {
        /** @var Collection $sections */
        $sections = $consultation->getConsultationStepType()
            ? $consultation->getConsultationStepType()->getOpinionTypes()
            : new ArrayCollection();

        $iterator = $sections->getIterator();

        if ($sections) {
            $iterator = $sections
                ->filter(function (OpinionType $section) {
                    return null === $section->getParent();
                })
                ->getIterator();

            // define ordering closure, using preferred comparison method/field
            $iterator->uasort(function ($first, $second) {
                return (int) $first->getPosition() > (int) $second->getPosition() ? 1 : -1;
            });
        }

        return $iterator;
    }

    public function resolvePropositionSection(OpinionContributionInterface $proposition)
    {
        return $proposition->getOpinionType();
    }

    public function resolvePropositionVoteAuthor(AbstractVote $vote): ?User
    {
        return $vote->getUser();
    }

    public function resolveReportingType(Reporting $reporting): int
    {
        return $reporting->getStatus();
    }

    public function resolveReportingAuthor(Reporting $reporting)
    {
        return $reporting->getReporter();
    }

    public function resolveArgumentUrl(Argument $argument): string
    {
        $parent = $argument->getParent();
        if ($parent instanceof Opinion) {
            return $this->container->get(OpinionUrlResolver::class)->__invoke($parent) .
                '#arg-' .
                $argument->getId();
        }
        if ($parent instanceof OpinionVersion) {
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
}
