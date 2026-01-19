<?php

namespace Capco\AppBundle\Command\Export;

use Capco\AppBundle\Command\Export\DataTransformer\ExportProposalVoteFullDataTransformer;
use Capco\AppBundle\Command\Export\DataTransformer\ExportProposalVoteGroupedDataTransformer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalVoteExporter
{
    public function __construct(
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly TranslatorInterface $translator,
        private readonly ExportProposalVoteFullDataTransformer $exportProposalVoteFullDataTransformer,
        private readonly ExportProposalVoteGroupedDataTransformer $exportProposalVoteGroupedDataTransformer,
    ) {
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>}>  $variants
     * @param array<string, mixed>                                            $proposalData
     * @param array{votes: array<string, int>, proposals: array<string, int>} $userStats
     */
    public function exportProposalVotes(
        array $variants,
        Proposal $proposal,
        ProposalStepInterface $step,
        array $proposalData,
        array $userStats,
        string $delimiter
    ): void {
        if (!$step->isVotable()) {
            return;
        }

        $votes = $this->fetchVotesForProposalAndStep(step: $step, proposal: $proposal);

        if ([] === $votes) {
            return;
        }

        $contributionTypeTranslated = $this->translator->trans(id: 'export_contribution_type_proposal_vote');

        $variantData = $this->prepareVariantData($variants, $proposalData, $step);

        foreach ($votes as $vote) {
            foreach ($variantData as $variantName => $data) {
                $voteData = $this->transformVoteForVariant(
                    variantName: $variantName,
                    vote: $vote,
                    step: $step,
                    userStats: $userStats,
                    contributionTypeTranslated: $contributionTypeTranslated,
                    translatedKeys: $data['translatedKeys']
                );

                if (null === $voteData) {
                    continue; // SIMPLIFIED variant
                }

                $this->writeVoteDataToCsv(
                    handle: $variants[$variantName]['handle'],
                    proposalData: $data['proposalData'],
                    voteData: $voteData,
                    headers: $variants[$variantName]['headers'],
                    delimiter: $delimiter
                );
            }
        }
    }

    /**
     * @param array<string, array{handle: resource, headers: array<string>}> $variants
     * @param array<string, mixed>                                           $proposalData
     *
     * @return array<string, array{proposalData: array<string, mixed>|null, translatedKeys: array<string, string>|null}>
     */
    private function prepareVariantData(
        array $variants,
        array $proposalData,
        ProposalStepInterface $step
    ): array {
        $variantData = [];

        foreach ($variants as $variantName => $config) {
            if ($variantName === ExportVariantsEnum::FULL->value) {
                $variantData[$variantName] = [
                    'proposalData' => $this->exportProposalVoteFullDataTransformer->transformProposal($proposalData),
                    'translatedKeys' => $this->exportProposalVoteFullDataTransformer->getTranslatedKeys(),
                ];
            } elseif ($variantName === ExportVariantsEnum::GROUPED->value) {
                $variantData[$variantName] = [
                    'proposalData' => $this->exportProposalVoteGroupedDataTransformer->transformProposal($proposalData),
                    'translatedKeys' => $this->exportProposalVoteGroupedDataTransformer->getTranslatedKeys($step),
                ];
            } elseif ($variantName === ExportVariantsEnum::SIMPLIFIED->value) {
                $variantData[$variantName] = [
                    'proposalData' => null,
                    'translatedKeys' => null,
                ];
            }
        }

        return $variantData;
    }

    /**
     * @param array{votes: array<string, int>, proposals: array<string, int>} $userStats
     * @param null|array<string, string>                                      $translatedKeys
     *
     * @return null|array<string, mixed>
     */
    private function transformVoteForVariant(
        string $variantName,
        mixed $vote,
        ProposalStepInterface $step,
        array $userStats,
        string $contributionTypeTranslated,
        ?array $translatedKeys
    ): ?array {
        if ($variantName === ExportVariantsEnum::SIMPLIFIED->value) {
            return null;
        }

        if ($variantName === ExportVariantsEnum::FULL->value) {
            return $this->exportProposalVoteFullDataTransformer->transformVote(
                vote: $vote,
                contributionTypeTranslated: $contributionTypeTranslated,
                translatedKeys: $translatedKeys
            );
        }

        if ($variantName === ExportVariantsEnum::GROUPED->value) {
            return $this->exportProposalVoteGroupedDataTransformer->transformVote(
                vote: $vote,
                contributionTypeTranslated: $contributionTypeTranslated,
                step: $step,
                userStats: $userStats,
                translatedKeys: $translatedKeys
            );
        }

        return null;
    }

    /**
     * @return iterable<array<string, mixed>>
     */
    private function fetchVotesForProposalAndStep(
        ProposalStepInterface $step,
        Proposal $proposal
    ): iterable {
        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->exportVotesByProposalAndStep(
                step: $step,
                proposal: $proposal
            );
        }

        if ($step instanceof CollectStep) {
            return $this->proposalCollectVoteRepository->exportVotesByProposalAndStep(
                step: $step,
                proposal: $proposal
            );
        }

        throw new \Exception('Step must implements ProposalStepInterface');
    }

    /**
     * @param array<string, mixed> $proposalData
     * @param array<string, mixed> $voteData
     * @param array<string>        $headers
     */
    private function writeVoteDataToCsv(
        mixed $handle,
        array $proposalData,
        array $voteData,
        array $headers,
        string $delimiter
    ): void {
        $row = [];
        $data = [...$proposalData, ...$voteData];

        foreach ($headers as $col) {
            $row[] = $data[$col] ?? null;
        }

        fputcsv($handle, $row, $delimiter);
    }
}
