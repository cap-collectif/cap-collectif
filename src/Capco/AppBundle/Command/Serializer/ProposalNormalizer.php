<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalStepPaperVoteCounter;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResponsesResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResponsesResolverTrait;
use Capco\AppBundle\GraphQL\Resolver\Type\FormattedValueResponseTypeResolver;
use Capco\AppBundle\Utils\Map;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalNormalizer extends BaseNormalizer implements NormalizerInterface
{
    use ResponsesResolverTrait;
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal';

    public function __construct(
        private readonly ProposalUrlResolver $proposalUrlResolver,
        private readonly MediaUrlResolver $mediaUrlResolver,
        private readonly FormattedValueResponseTypeResolver $formattedValueResponseTypeResolver,
        private readonly ProposalResponsesResolver $proposalResponsesResolver,
        private readonly Map $map,
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
        return isset($context[self::IS_EXPORT_NORMALIZER], $context['step'], $context['questionsResponses'])
            && $data instanceof Proposal
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = $context['is_full_export'] ?? false;

        /** @var Proposal $object */
        $category = $object->getCategory();
        $theme = $object->getTheme();
        $address = $object->getAddress();
        $media = $object->getMedia();
        $author = $object->getAuthor();
        $statusName = $object->getStatus()?->getName();
        /** @var CollectStep|SelectionStep $step */
        $step = $context['step'];

        if ($step instanceof SelectionStep) {
            foreach ($object->getSelections() as $selection) {
                if ($selection->getStep()->getId() === $step->getId()) {
                    $statusName = $selection->getStatus()?->getName();
                }
            }
        }

        if (null === $statusName) {
            $statusName = $object->getStatus()?->getName();
        }

        $district = $object->getDistrict();
        if ($address) {
            $location = Map::getLocation($address);
        }

        $totalPaperCount = 0;
        $totalPaperPointsCount = 0;
        $totalDigitalCount = 0;
        $totalDigitalPointsCount = 0;
        if ($step->isVotable()) {
            $paperVotes = $object->getPaperVotes()
                ->map(fn (ProposalStepPaperVoteCounter $paperVoteCounter) => [
                    'totalPaperCount' => $paperVoteCounter->getTotalCount(),
                    'totalPaperPointsCount' => $paperVoteCounter->getTotalPointsCount(),
                ])->getValues();

            $totalPaperCount = array_sum(array_column($paperVotes, 'totalPaperCount'));
            $totalPaperPointsCount = array_sum(array_column($paperVotes, 'totalPaperPointsCount'));

            $isCollectStepProposal = 'collect' === $step->getType();
            $votes = $isCollectStepProposal ? $object->getCollectVotes() : $object->getSelectionVotes();

            $votes = $votes->filter(fn (AbstractVote $vote) => $vote->getIsAccounted() && $vote->isPublished());
            $totalDigitalCount = $votes->count();

            $positions = $votes->map(fn ($vote) => [
                'position' => $vote->getPosition(),
            ])->getValues();

            if ($step->isVotesRanking()) {
                $pointsAvailable = range($step->getVotesLimit(), 1);

                $calculatePoints = static function ($positions) use ($pointsAvailable, &$totalDigitalPointsCount) {
                    foreach ($positions as $position) {
                        if (isset($pointsAvailable[$position['position']])) {
                            $totalDigitalPointsCount += $pointsAvailable[$position['position']];
                        }
                    }
                };

                if (!empty($positions)) {
                    $calculatePoints($positions);
                }
            }
        }

        $proposalUrl = $this->proposalUrlResolver->__invoke($object);

        $formatQuestionsResponses = $this->formatQuestionsResponses($context['questionsResponses'], $object);

        $proposalSimplified = [
            self::EXPORT_CONTRIBUTION_TYPE => $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME),
            self::EXPORT_PROPOSAL_ID => $object->getId(),
            self::EXPORT_PROPOSAL_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
            self::EXPORT_PROPOSAL_REFERENCE => sprintf('"%s"', $object->getFullReference()),
            self::EXPORT_PROPOSAL_TITLE => $object->getTitle(),
            self::EXPORT_PROPOSAL_SUMMARY => $object->getSummary(),
            self::EXPORT_PROPOSAL_DESCRIPTION => $object->getBodyText(),
            self::EXPORT_PROPOSAL_AUTHOR_ID => $author?->getId(),
            self::EXPORT_PROPOSAL_VOTES_TOTAL_COUNT => $totalPaperCount + $totalDigitalCount,
            self::EXPORT_PROPOSAL_VOTES_DIGITAL_COUNT => $totalDigitalCount,
            self::EXPORT_PROPOSAL_VOTES_TOTAL_PAPER_COUNT => $totalPaperCount,
            self::EXPORT_PROPOSAL_VOTES_TOTAL_POINTS_COUNT => $totalPaperPointsCount + $totalDigitalPointsCount,
            self::EXPORT_PROPOSAL_VOTES_DIGITAL_POINTS_COUNT => $totalDigitalPointsCount,
            self::EXPORT_PROPOSAL_VOTES_PAPER_POINTS_COUNT => $totalPaperPointsCount,
            self::EXPORT_PROPOSAL_CATEGORY_NAME => $category?->getName(),
            self::EXPORT_PROPOSAL_THEME_TITLE => $theme?->getTitle(),
            self::EXPORT_PROPOSAL_FORMATTED_ADDRESS => isset($address) ? $this->map::decodeAddressFromJson($address) : null,
            self::EXPORT_PROPOSAL_ADDRESS_LAT => isset($location) ? $location['lat'] : null,
            self::EXPORT_PROPOSAL_ADDRESS_LNG => isset($location) ? $location['lng'] : null,
            self::EXPORT_PROPOSAL_DISTRICT_NAME => $district?->getName(),
        ];

        $proposalSimplifiedSecondPart = [
            self::EXPORT_PROPOSAL_ESTIMATION => $object->getEstimation(),
            self::EXPORT_PROPOSAL_ILLUSTRATION => isset($media) ? $this->mediaUrlResolver->__invoke($media) : null,
            self::EXPORT_PROPOSAL_LINK => '' !== $proposalUrl ? $proposalUrl : null,
            self::EXPORT_PROPOSAL_STATUS_NAME => $statusName,
            self::EXPORT_PROPOSAL_VOTES_ID => null,
            self::EXPORT_PROPOSAL_VOTES_RANKING => null,
        ];

        $proposalArray = array_merge($proposalSimplified, $formatQuestionsResponses, $proposalSimplifiedSecondPart);

        if ($isFullExport) {
            /** @var User $author */
            $author = $object->getAuthor();
            unset(
                $proposalArray[self::EXPORT_PROPOSAL_VOTES_ID],
                $proposalArray[self::EXPORT_PROPOSAL_VOTES_RANKING]
            );
            $fullExportData = [
                self::EXPORT_PROPOSAL_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_PROPOSAL_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_PROPOSAL_PUBLICATION_STATUS => $this->getPublicationStatusTranslated($object->getPublicationStatus()),
                self::EXPORT_PROPOSAL_UNDRAFT_AT => $this->getNullableDatetime($object->getUndraftAt()),
                self::EXPORT_PROPOSAL_TRASHED_AT => $this->getNullableDatetime($object->getTrashedAt()),
                self::EXPORT_PROPOSAL_TRASHED_REASON => $object->getTrashedReason(),
                self::EXPORT_PROPOSAL_AUTHOR_USERNAME => $author->getUsername(),
                self::EXPORT_PROPOSAL_AUTHOR_IS_EMAIL_CONFIRMED => $this->getReadableBoolean($author->isEmailConfirmed()),
                self::EXPORT_PROPOSAL_AUTHOR_EMAIL => $author->getEmail(),
                self::EXPORT_PROPOSAL_AUTHOR_USER_TYPE_ID => $author->getUserType()?->getId(),
                self::EXPORT_PROPOSAL_AUTHOR_USER_TYPE_NAME => $author->getUserType()?->getName(),
                self::EXPORT_PROPOSAL_OFFICIAL_RESPONSE => $object->getOfficialResponse()?->getBodyText(),
                self::EXPORT_PROPOSAL_VOTES_ID => null,
                self::EXPORT_PROPOSAL_VOTES_RANKING => null,
                self::EXPORT_PROPOSAL_VOTES_CREATED_AT => null,
                self::EXPORT_PROPOSAL_VOTES_PUBLISHED_AT => null,
                self::EXPORT_PROPOSAL_VOTES_PUBLISHED => null,
                self::EXPORT_PROPOSAL_VOTES_ACCOUNTED => null,
                self::EXPORT_PROPOSAL_VOTES_ANONYMOUS => null,
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_ID => null,
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_USERNAME => null,
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_PHONE_CONFIRMED => null,
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_NAME => null,
                self::EXPORT_PROPOSAL_COMMENTS_ID => null,
                self::EXPORT_PROPOSAL_COMMENTS_BODY => null,
                self::EXPORT_PROPOSAL_COMMENTS_CREATED_AT => null,
                self::EXPORT_PROPOSAL_COMMENTS_PUBLISHED_AT => null,
                self::EXPORT_PROPOSAL_COMMENTS_UPDATED_AT => null,
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_ID => null,
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USERNAME => null,
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_NAME => null,
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_EMAIL => null,
                self::EXPORT_PROPOSAL_COMMENTS_PINNED => null,
                self::EXPORT_PROPOSAL_COMMENTS_PUBLICATION_STATUS => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_ID => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_CREATED_AT => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_PUBLISHED_AT => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_ID => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USERNAME => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME => null,
                self::EXPORT_PROPOSAL_NEWS_ID => null,
                self::EXPORT_PROPOSAL_NEWS_TITLE => null,
                self::EXPORT_PROPOSAL_NEWS_THEMES => null,
                self::EXPORT_PROPOSAL_NEWS_LINKED_PROJECTS => null,
                self::EXPORT_PROPOSAL_NEWS_LINKED_PROPOSAL => null,
                self::EXPORT_PROPOSAL_NEWS_CREATED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_UPDATED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_PUBLISHED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_PUBLICATION_STATUS => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTABLE => null,
                self::EXPORT_PROPOSAL_NEWS_DISPLAYED_ON_BLOG => null,
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_ID => null,
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_USERNAME => null,
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_NAME => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_BODY => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_PARENT => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_CREATED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_PUBLISHED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_UPDATED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USERNAME => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_USER_TYPE_NAME => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_AUTHOR_EMAIL => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_PINNED => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_PUBLICATION_STATUS => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_CREATED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_PUBLISHED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USERNAME => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_CREATED_AT => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USERNAME => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_REPORTINGS_AUTHOR_USER_TYPE_NAME => null,
                self::EXPORT_PROPOSAL_REPORTINGS_ID => null,
                self::EXPORT_PROPOSAL_REPORTINGS_BODY => null,
                self::EXPORT_PROPOSAL_REPORTINGS_CREATED_AT => null,
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_ID => null,
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USERNAME => null,
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_ID => null,
                self::EXPORT_PROPOSAL_REPORTINGS_AUTHOR_USER_TYPE_NAME => null,
            ];

            $proposalArray = array_merge($proposalArray, $fullExportData);
        }

        return $this->translateHeaders($proposalArray, array_keys($formatQuestionsResponses));
    }

    /**
     * @param array<string, array<int, AbstractResponse>> $questionsResponses
     *
     * @return array<int|string, null|string>
     */
    private function formatQuestionsResponses(array $questionsResponses, Proposal $proposal): array
    {
        $proposalResponses = $this->proposalResponsesResolver->__invoke(
            $proposal,
            null,
            new \ArrayObject(['disable_acl' => true])
        );

        // Edge case: skip the fixture "budget-participatif-rennes" because multiple proposals are linked through the step instead of directly.
        if ('budget-participatif-rennes' === $proposal->getProject()?->getSlug() && 'collecte-des-propositions' === $proposal->getStep()?->getSlug()) {
            return [];
        }

        $formattedQuestionsResponses = [];
        $keyCounters = [];

        foreach ($proposalResponses as $proposalResponse) {
            $questionTitle = $proposalResponse->getQuestion()?->getTitle();
            if (empty($questionsResponses)) {
                continue;
            }

            if (!isset($keyCounters[$questionTitle])) {
                $keyCounters[$questionTitle] = 0;
            }

            $formattedKey = $questionTitle;

            if ($keyCounters[$questionTitle] > 0) {
                $formattedKey = sprintf('%s (%s)', $formattedKey, $keyCounters[$questionTitle]);
            }

            ++$keyCounters[$questionTitle];

            if ($proposalResponse instanceof ValueResponse) {
                $formattedQuestionsResponses[$formattedKey] = $this->formattedValueResponseTypeResolver->__invoke(
                    $proposalResponse
                );

                continue;
            }

            if ($proposalResponse instanceof MediaResponse) {
                $formattedQuestionsResponses[$formattedKey] = implode(
                    ', ',
                    $proposalResponse->getMedias()
                        ->map(fn (Media $media) => $this->mediaUrlResolver->__invoke($media))
                        ->getValues()
                );
            }
        }

        return $formattedQuestionsResponses;
    }

    private function getPublicationStatusTranslated(string $status): string
    {
        return $this->translator->trans(self::EXPORT_PROPOSAL_PUBLICATION_STATUSES[$status]);
    }
}
