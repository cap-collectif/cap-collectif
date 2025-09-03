<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalVoteNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal_vote';

    public function __construct(
        private readonly ProposalNormalizer $proposalNormalizer,
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
        $isProposalVote = $data instanceof ProposalCollectVote || $data instanceof ProposalSelectionVote;

        return isset($context[self::IS_EXPORT_NORMALIZER]) && $isProposalVote && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $fullExportData = [];
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);

        /** @var ProposalCollectVote|ProposalSelectionVote $object */
        $isPrivate = $object->isPrivate();

        /** @var null|ContributorInterface $author */
        $author = $object->getContributor();

        $isUser = $author instanceof User;

        $userType = $isUser ? $author->getUserType() : null;

        /** @var CollectStep|SelectionStep $step */
        $step = $object->getStep();
        $position = null;
        if ($step->isVotesRanking()) {
            $position = $object->getPosition();
        }

        $proposalNormalized = $this->proposalNormalizer->normalize(
            $object->getProposal(),
            null,
            [
                'step' => $context['step'],
                'questionsResponses' => $context['questionsResponses'],
                BaseNormalizer::EXPORT_VARIANT => ExportVariantsEnum::SIMPLIFIED,
            ],
        );
        $proposalNormalized[self::EXPORT_PROPOSAL_VOTES_ID] = $object->getId();
        $proposalNormalized[self::EXPORT_PROPOSAL_VOTES_RANKING] = null !== $position ? $position + 1 : null;
        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PROPOSAL_VOTES_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_PROPOSAL_VOTES_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
                self::EXPORT_PROPOSAL_VOTES_PUBLISHED => $this->getReadableBoolean($object->isPublished()),
                self::EXPORT_PROPOSAL_VOTES_ACCOUNTED => $this->getReadableBoolean($object->getIsAccounted()),
                self::EXPORT_PROPOSAL_VOTES_ANONYMOUS => $this->getReadableBoolean($isPrivate),
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_ID => $author->getId(),
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_USERNAME => $author->getUsername(),
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_EMAIL_CONFIRMED => $this->getReadableBoolean($author->isEmailConfirmed()),
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_PHONE_CONFIRMED => $this->getReadableBoolean($author->isPhoneConfirmed()),
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_ID => $userType?->getId(),
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_NAME => $userType?->getName(),
            ];
        }

        $proposalNormalized[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $proposalNormalized, $fullExportData), array_keys($context['questionsResponses']));
    }
}
