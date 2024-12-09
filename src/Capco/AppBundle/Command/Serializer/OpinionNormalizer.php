<?php

/** @noinspection CallableParameterUseCaseInTypeContextInspection */

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OpinionNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_opinion';
    private const FULL_EXPORT_SORTED = [
        self::EXPORT_CONTRIBUTION_TYPE => null,
        self::EXPORT_CONTRIBUTION_ID => null,
        self::EXPORT_CONTRIBUTION_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_AUTHOR_TYPE_NAME => null,
        self::EXPORT_CONTRIBUTION_CONSULTATION_TITLE => null,
        self::EXPORT_CONTRIBUTION_SECTION_TITLE => null,
        self::EXPORT_CONTRIBUTION_TITLE => null,
        self::EXPORT_CONTRIBUTION_BODY_TEXT => null,
        self::EXPORT_CONTRIBUTIONS_CREATED_AT => null,
        self::EXPORT_CONTRIBUTIONS_UPDATED_AT => null,
        self::EXPORT_CONTRIBUTION_URL => null,
        self::EXPORT_CONTRIBUTION_PUBLISHED => null,
        self::EXPORT_CONTRIBUTION_TRASHED => null,
        self::EXPORT_CONTRIBUTION_TRASHED_STATUS => null,
        self::EXPORT_CONTRIBUTION_TRASHED_AT => null,
        self::EXPORT_CONTRIBUTION_TRASHED_REASON => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT_OK => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT_NOK => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST => null,
        self::EXPORT_CONTRIBUTION_SOURCES_COUNT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_COUNT => null,
        self::EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_TITLE => null,
        self::EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_BODY_TEXT => null,
        self::EXPORT_CONTRIBUTION_VOTES_ID => null,
        self::EXPORT_CONTRIBUTION_VOTES_RELATED_ID => null,
        self::EXPORT_CONTRIBUTION_VOTES_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_VOTES_VALUE => null,
        self::EXPORT_CONTRIBUTION_VOTES_CREATED_AT => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_KIND => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_ID => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_BODY => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_CREATED_AT => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_UPDATED_AT => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_URL => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_PUBLISHED => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_STATUS => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_AT => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_REASON => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_VOTES_COUNT => null,
        self::EXPORT_CONTRIBUTION_REPORTINGS_RELATED_ID => null,
        self::EXPORT_CONTRIBUTION_REPORTINGS_RELATED_KIND => null,
        self::EXPORT_CONTRIBUTION_REPORTINGS_ID => null,
        self::EXPORT_CONTRIBUTION_REPORTINGS_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_REPORTINGS_TYPE => null,
        self::EXPORT_CONTRIBUTION_REPORTINGS_BODY => null,
        self::EXPORT_CONTRIBUTION_REPORTINGS_CREATED_AT => null,
        self::EXPORT_CONTRIBUTION_SOURCES_ID => null,
        self::EXPORT_CONTRIBUTION_SOURCES_RELATED_ID => null,
        self::EXPORT_CONTRIBUTION_SOURCES_RELATED_KIND => null,
        self::EXPORT_CONTRIBUTION_SOURCES_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_SOURCES_TRASHED => null,
        self::EXPORT_CONTRIBUTION_SOURCES_TRASHED_STATUS => null,
        self::EXPORT_CONTRIBUTION_SOURCES_TRASHED_AT => null,
        self::EXPORT_CONTRIBUTION_SOURCES_TRASHEDREASON => null,
        self::EXPORT_CONTRIBUTION_SOURCES_BODY => null,
        self::EXPORT_CONTRIBUTION_SOURCES_CREATED_AT => null,
        self::EXPORT_CONTRIBUTION_SOURCES_UPDATED_AT => null,
        self::EXPORT_CONTRIBUTION_SOURCES_PUBLISHED => null,
        self::EXPORT_CONTRIBUTION_SOURCES_VOTES_COUNT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_ID => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_TITLE => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_CREATED_AT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_UPDATED_AT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK => null,
    ];

    private const SIMPLIFIED_EXPORT_SORTED = [
        self::EXPORT_CONTRIBUTION_TYPE => null,
        self::EXPORT_CONTRIBUTION_ID => null,
        self::EXPORT_CONTRIBUTION_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_AUTHOR_TYPE_NAME => null,
        self::EXPORT_CONTRIBUTION_CONSULTATION_TITLE => null,
        self::EXPORT_CONTRIBUTION_SECTION_TITLE => null,
        self::EXPORT_CONTRIBUTION_TITLE => null,
        self::EXPORT_CONTRIBUTION_BODY_TEXT => null,
        self::EXPORT_CONTRIBUTION_URL => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT_OK => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE => null,
        self::EXPORT_CONTRIBUTION_VOTES_COUNT_NOK => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST => null,
        self::EXPORT_CONTRIBUTION_VOTES_ID => null,
        self::EXPORT_CONTRIBUTION_VOTES_RELATED_ID => null,
        self::EXPORT_CONTRIBUTION_VOTES_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_VOTES_VALUE => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_ID => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_BODY => null,
        self::EXPORT_CONTRIBUTION_ARGUMENTS_URL => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_ID => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_AUTHOR_ID => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_TITLE => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE => null,
        self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK => null,
    ];

    public function __construct(
        private readonly OpinionUrlResolver $opinionUrlResolver,
        TranslatorInterface $translator
    ) {
        parent::__construct($translator);
    }

    /**
     * @param array<string, null|bool|string> $context
     * @param mixed                           $data
     * @param null|mixed                      $format
     */
    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER])
            && $data instanceof Opinion
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = $context['is_full_export'] ?? null;
        if (isset($context['skip']) && true === $context['skip']) {
            $exportData = $isFullExport ? self::FULL_EXPORT_SORTED : self::SIMPLIFIED_EXPORT_SORTED;

            return $this->translateHeaders($exportData);
        }

        $step = $object->getStep();
        $isVotable = null !== $step ? $step->isVotable() : null;
        $author = $object->getAuthor();
        $opinionType = $object->getOpinionType();
        $votes = $object->getVotes();
        $arguments = $object->getArguments();
        $sources = $object->getSources();
        $versions = $object->getVersions();
        $userType = null !== $author ? $author->getUserType() : null;
        $opinionTypeConsultation = null !== $opinionType ? $opinionType->getConsultation() : null;

        $opinionArray = [
            self::EXPORT_CONTRIBUTION_TYPE => $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME),
            self::EXPORT_CONTRIBUTION_ID => $object->getId(),
            self::EXPORT_CONTRIBUTION_AUTHOR_ID => null !== $author ? $author->getId() : null,
            self::EXPORT_CONTRIBUTION_AUTHOR_TYPE_NAME => null !== $userType ? $userType->getName() : null,
            self::EXPORT_CONTRIBUTION_CONSULTATION_TITLE => null !== $opinionTypeConsultation ? $opinionTypeConsultation->getTitle() : null,
            self::EXPORT_CONTRIBUTION_SECTION_TITLE => null !== $opinionType ? $opinionType->getTitle() : null,
            self::EXPORT_CONTRIBUTION_TITLE => $object->getTitle(),
            self::EXPORT_CONTRIBUTION_BODY_TEXT => $object->getBodyText(),
            self::EXPORT_CONTRIBUTION_URL => $this->opinionUrlResolver->__invoke($object),
            self::EXPORT_CONTRIBUTION_VOTES_COUNT => $isVotable ? $votes->count() : 0,
            self::EXPORT_CONTRIBUTION_VOTES_COUNT_OK => $isVotable ? $this->getVoteCountPerOpinion($object, $object->getStep(), 1) : 0,
            self::EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE => $isVotable ? $this->getVoteCountPerOpinion($object, $object->getStep(), 0) : 0,
            self::EXPORT_CONTRIBUTION_VOTES_COUNT_NOK => $isVotable ? $this->getVoteCountPerOpinion($object, $object->getStep(), -1) : 0,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT => $arguments->count(),
            self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR => $this->getArgumentCountPerOpinion($object, $object->getStep(), 1),
            self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST => $this->getArgumentCountPerOpinion($object, $object->getStep(), -1),
            self::EXPORT_CONTRIBUTION_VOTES_ID => null,
            self::EXPORT_CONTRIBUTION_VOTES_RELATED_ID => null,
            self::EXPORT_CONTRIBUTION_VOTES_AUTHOR_ID => null,
            self::EXPORT_CONTRIBUTION_VOTES_VALUE => null,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_ID => null,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID => null,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_AUTHOR_ID => null,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE => null,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_BODY => null,
            self::EXPORT_CONTRIBUTION_ARGUMENTS_URL => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_ID => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_AUTHOR_ID => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_TITLE => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE => null,
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK => null,
        ];

        if ($isFullExport) {
            $opinionArray = [
                self::EXPORT_CONTRIBUTION_TYPE => $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME),
                self::EXPORT_CONTRIBUTION_ID => $object->getId(),
                self::EXPORT_CONTRIBUTION_AUTHOR_ID => null !== $author ? $author->getId() : null,
                self::EXPORT_CONTRIBUTION_AUTHOR_TYPE_NAME => null !== $userType ? $userType->getName() : null,
                self::EXPORT_CONTRIBUTION_CONSULTATION_TITLE => null !== $opinionTypeConsultation ? $opinionTypeConsultation->getTitle() : null,
                self::EXPORT_CONTRIBUTION_SECTION_TITLE => null !== $opinionType ? $opinionType->getTitle() : null,
                self::EXPORT_CONTRIBUTION_TITLE => $object->getTitle(),
                self::EXPORT_CONTRIBUTION_BODY_TEXT => $object->getBodyText(),
                self::EXPORT_CONTRIBUTIONS_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_CONTRIBUTIONS_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_CONTRIBUTION_URL => $this->opinionUrlResolver->__invoke($object),
                self::EXPORT_CONTRIBUTION_PUBLISHED => $this->getReadableBoolean($object->isPublished()),
                self::EXPORT_CONTRIBUTION_TRASHED => $this->getReadableBoolean($object->isTrashed()),
                self::EXPORT_CONTRIBUTION_TRASHED_STATUS => $object->getTrashedStatus(),
                self::EXPORT_CONTRIBUTION_TRASHED_AT => $this->getNullableDatetime($object->getTrashedAt()),
                self::EXPORT_CONTRIBUTION_TRASHED_REASON => $object->getTrashedReason(),
                self::EXPORT_CONTRIBUTION_VOTES_COUNT => $isVotable ? $votes->count() : 0,
                self::EXPORT_CONTRIBUTION_VOTES_COUNT_OK => $isVotable ? $this->getVoteCountPerOpinion($object, $object->getStep(), 1) : 0,
                self::EXPORT_CONTRIBUTION_VOTES_COUNT_MITIGE => $isVotable ? $this->getVoteCountPerOpinion($object, $object->getStep(), 0) : 0,
                self::EXPORT_CONTRIBUTION_VOTES_COUNT_NOK => $isVotable ? $this->getVoteCountPerOpinion($object, $object->getStep(), -1) : 0,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT => $arguments->count(),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_FOR => $this->getArgumentCountPerOpinion($object, $object->getStep(), 1),
                self::EXPORT_CONTRIBUTION_ARGUMENTS_COUNT_AGAINST => $this->getArgumentCountPerOpinion($object, $object->getStep(), -1),
                self::EXPORT_CONTRIBUTION_SOURCES_COUNT => $sources->count(),
                self::EXPORT_CONTRIBUTION_VERSIONS_COUNT => $versions->count(),
                self::EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_TITLE => null,
                self::EXPORT_CONTRIBUTION_CONTEXT_ELEMENT_BODY_TEXT => null,
                self::EXPORT_CONTRIBUTION_VOTES_ID => null,
                self::EXPORT_CONTRIBUTION_VOTES_RELATED_ID => null,
                self::EXPORT_CONTRIBUTION_VOTES_AUTHOR_ID => null,
                self::EXPORT_CONTRIBUTION_VOTES_VALUE => null,
                self::EXPORT_CONTRIBUTION_VOTES_CREATED_AT => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_ID => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_RELATED_KIND => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_ID => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_AUTHOR_ID => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TYPE => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_BODY => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_CREATED_AT => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_UPDATED_AT => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_URL => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_PUBLISHED => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_STATUS => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_AT => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_TRASHED_REASON => null,
                self::EXPORT_CONTRIBUTION_ARGUMENTS_VOTES_COUNT => null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_RELATED_ID => null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_RELATED_KIND => null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_ID => null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_AUTHOR_ID => null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_TYPE => null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_BODY => null,
                self::EXPORT_CONTRIBUTION_REPORTINGS_CREATED_AT => null,
                self::EXPORT_CONTRIBUTION_SOURCES_ID => null,
                self::EXPORT_CONTRIBUTION_SOURCES_RELATED_ID => null,
                self::EXPORT_CONTRIBUTION_SOURCES_RELATED_KIND => null,
                self::EXPORT_CONTRIBUTION_SOURCES_AUTHOR_ID => null,
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHED => null,
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHED_STATUS => null,
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHED_AT => null,
                self::EXPORT_CONTRIBUTION_SOURCES_TRASHEDREASON => null,
                self::EXPORT_CONTRIBUTION_SOURCES_BODY => null,
                self::EXPORT_CONTRIBUTION_SOURCES_CREATED_AT => null,
                self::EXPORT_CONTRIBUTION_SOURCES_UPDATED_AT => null,
                self::EXPORT_CONTRIBUTION_SOURCES_PUBLISHED => null,
                self::EXPORT_CONTRIBUTION_SOURCES_VOTES_COUNT => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_ID => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_AUTHOR_ID => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_TITLE => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_CREATED_AT => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_UPDATED_AT => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE => null,
                self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK => null,
            ];
        }

        return $this->translateHeaders($opinionArray);
    }

    private function getArgumentCountPerOpinion(Opinion $opinion, ConsultationStep $consultationStep, int $filterValue): int
    {
        $filterClosure = fn (Argument $argument) => null !== $argument->getStep()
            && $argument->getStep()->getId() === $consultationStep->getId()
            && $argument->isPublished()
            && $argument->getType() === $filterValue;

        return $opinion->getArguments()->filter($filterClosure)->count();
    }

    private function getVoteCountPerOpinion(Opinion $opinion, ConsultationStep $consultationStep, int $filterValue): int
    {
        $filterClosure = fn (OpinionVote $vote) => null !== $vote->getStep()
            && $vote->getStep()->getId() === $consultationStep->getId()
            && $vote->getIsAccounted()
            && ($vote->getValue() === $filterValue);

        return $opinion->getVotes()->filter($filterClosure)->count();
    }
}
