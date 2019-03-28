<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
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
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
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
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Symfony\Component\Routing\RouterInterface;

class ConsultationResolver implements ResolverInterface
{
    public $project;
    private $typeResolver;
    private $opinionRepository;
    private $consultationStepRepository;
    private $router;
    private $opinionUrlResolver;

    public function __construct(
        TypeResolver $typeResolver,
        OpinionRepository $opinionRepository,
        ConsultationStepRepository $consultationStepRepository,
        RouterInterface $router,
        OpinionUrlResolver $opinionUrlResolver
    ) {
        $this->typeResolver = $typeResolver;
        $this->opinionRepository = $opinionRepository;
        $this->consultationStepRepository = $consultationStepRepository;
        $this->router = $router;
        $this->opinionUrlResolver = $opinionUrlResolver;
    }

    public function resolveContributionType($data)
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($data instanceof Opinion) {
            return $this->typeResolver->resolve('Opinion');
        }
        if ($data instanceof OpinionVote) {
            return $this->typeResolver->resolve('OpinionVote');
        }
        if ($data instanceof OpinionVersion) {
            return $this->typeResolver->resolve('Version');
        }
        if ($data instanceof OpinionVersionVote) {
            return $this->typeResolver->resolve('VersionVote');
        }
        if ($data instanceof Argument) {
            return $this->typeResolver->resolve('Argument');
        }
        if ($data instanceof Source) {
            return $this->typeResolver->resolve('Source');
        }
        if ($data instanceof Reporting) {
            return $this->typeResolver->resolve('Reporting');
        }
        if ($data instanceof Comment) {
            return $this->typeResolver->resolve('Comment');
        }
        if ($data instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($data instanceof Reply) {
            return $this->typeResolver->resolve('InternalReply');
        }
        if ($data instanceof Answer) {
            return $this->typeResolver->resolve('Answer');
        }
        if ($data instanceof Post) {
            return $this->typeResolver->resolve('Post');
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
            $criteria = ['section' => $section, 'trashed' => false];
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];

            return $this->opinionRepository
                ->getByCriteriaOrdered($criteria, $orderBy, null, $offset)
                ->getIterator()
                ->getArrayCopy();
        });

        $totalCount = $section->getOpinions()->count();

        return $paginator->auto($args, $totalCount);
    }

    public function resolve(Arg $args)
    {
        if (isset($args['id'])) {
            $stepId = GlobalId::fromGlobalId($args['id'])['id'];
            $consultation = $this->consultationStepRepository->find($stepId);

            return [$consultation];
        }

        return $this->consultationStepRepository->findAll();
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

        return $this->router->generate(
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
        return $this->opinionRepository->countByOpinionType($type->getId());
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
            return $this->opinionUrlResolver->__invoke($parent) . '#arg-' . $argument->getId();
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

        return $this->router->generate(
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
