<?php

namespace Capco\Tests\Normalizer\Proposal;

use Capco\AppBundle\Command\Serializer\ProposalNormalizer;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResponsesResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Type\FormattedValueResponseTypeResolver;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Utils\Map;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Translation\Translator;

/**
 * @internal
 * @coversNothing
 */
class ProposalNormalizerTest extends KernelTestCase
{
    private ?object $proposalRepository;

    protected function setUp(): void
    {
        self::bootKernel();
        $this->proposalRepository = self::$container->get(ProposalRepository::class);
    }

    /**
     * @dataProvider proposalsNormalizedDataProvider
     *
     * @param array<string, null|int|string> $expectedDataNormalized
     */
    public function testExportProposalNormalizer(string $proposalId, string $stepId, array $expectedDataNormalized): void
    {
        $proposalUrlResolverMock = $this->createMock(ProposalUrlResolver::class);
        $mediaUrlResolverMock = $this->createMock(MediaUrlResolver::class);
        $mapMock = $this->createMock(Map::class);
        $formattedValueResponseTypeResolverMock = $this->createMock(FormattedValueResponseTypeResolver::class);
        $proposalResponsesResolverMock = $this->createMock(ProposalResponsesResolver::class);
        $translator = new Translator('fr_FR');

        $normalizer = new ProposalNormalizer(
            $proposalUrlResolverMock,
            $mediaUrlResolverMock,
            $formattedValueResponseTypeResolverMock,
            $proposalResponsesResolverMock,
            $mapMock,
            $translator
        );

        $proposal = $this->proposalRepository->findOneBy(['id' => $proposalId]);

        $statusMock = $this->createMock(Status::class);
        $statusMock->method('getName')->willReturn('Approuvé');
        $stepMock = $this->createMock(CollectStep::class);
        $stepMock->method('getDefaultStatus')->willReturn($statusMock);
        $stepMock->method('isVotable')->willReturn(true);

        $result = $normalizer->normalize(
            $proposal,
            null,
            [
                'step' => $stepMock,
                'questionsResponses' => [],
            ]
        );

        $this->assertEquals($expectedDataNormalized, $result);
    }

    /**
     * @return array<int, array<string, array<string, null|int|string>|string>>
     */
    public function proposalsNormalizedDataProvider(): array
    {
        return [
            [
                'proposalId' => 'question1',
                'stepId' => 'collectQuestionVoteAvecClassement',
                'expectedDataNormalized' => [
                    'export_contribution_type' => 'export_contribution_type_proposal',
                    'export_proposal_id' => 'question1',
                    'export_proposal_published_at' => '2017-02-01 00:00:01',
                    'export_proposal_reference' => '"113-48"',
                    'export_proposal_title' => 'Comment faire de l\'électricité ?',
                    'export_proposal_summary' => null,
                    'export_proposal_description' => 'TODO',
                    'export_proposal_category_name' => null,
                    'export_proposal_theme_title' => null,
                    'export_proposal_formatted_address' => null,
                    'export_proposal_address_lat' => null,
                    'export_proposal_address_lng' => null,
                    'export_proposal_district_name' => null,
                    'export_proposal_author_id' => 'user1',
                    'export_proposal_votes_total_count' => 4,
                    'export_proposal_votes_digital_count' => 1,
                    'export_proposal_votes_paper_count' => 3,
                    'export_proposal_votes_total_points_count' => 6,
                    'export_proposal_votes_digital_points_count' => 0,
                    'export_proposal_votes_paper_points_count' => 6,
                    'export_proposal_estimation' => null,
                    'export_proposal_illustration' => null,
                    'export_proposal_link' => null,
                    'export_proposal_status_name' => 'Approuvé',
                    'export_proposal_votes_id' => null,
                    'export_proposal_votes_ranking' => null,
                ],
            ],
            [
                'proposalId' => 'question2',
                'stepId' => 'collectQuestionVoteAvecClassement',
                'expectedDataNormalized' => [
                    'export_contribution_type' => 'export_contribution_type_proposal',
                    'export_proposal_id' => 'question2',
                    'export_proposal_published_at' => '2017-02-01 00:00:02',
                    'export_proposal_reference' => '"113-49"',
                    'export_proposal_title' => 'Et chez Youpie c\'est mieux ?',
                    'export_proposal_summary' => null,
                    'export_proposal_description' => 'TODO',
                    'export_proposal_category_name' => null,
                    'export_proposal_theme_title' => null,
                    'export_proposal_formatted_address' => null,
                    'export_proposal_address_lat' => null,
                    'export_proposal_address_lng' => null,
                    'export_proposal_district_name' => null,
                    'export_proposal_author_id' => 'user1',
                    'export_proposal_votes_total_count' => 3,
                    'export_proposal_votes_digital_count' => 0,
                    'export_proposal_votes_paper_count' => 3,
                    'export_proposal_votes_total_points_count' => 6,
                    'export_proposal_votes_digital_points_count' => 0,
                    'export_proposal_votes_paper_points_count' => 6,
                    'export_proposal_estimation' => null,
                    'export_proposal_illustration' => null,
                    'export_proposal_link' => null,
                    'export_proposal_status_name' => 'Approuvé',
                    'export_proposal_votes_id' => null,
                    'export_proposal_votes_ranking' => null,
                ],
            ],
        ];
    }
}
