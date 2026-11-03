<?php

namespace CapcoTests\UnitTests\Mailer;

use Capco\AppBundle\Enum\StatusColor;
use Capco\AppBundle\Mailer\Message\Follower\FollowerActivitiesDigest;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class FollowerActivitiesDigestTest extends TestCase
{
    public function testDisplaysAtMostFiveProposalsAcrossProjects(): void
    {
        $digest = FollowerActivitiesDigest::build([
            'project1' => self::project(4),
            'project2' => self::project(3),
            'project3' => self::project(1),
        ]);

        self::assertSame(8, $digest['proposalCount']);
        self::assertSame(3, $digest['hiddenProposalCount']);
        self::assertCount(2, $digest['projects']);
        self::assertCount(4, $digest['projects'][0]['proposals']);
        self::assertCount(1, $digest['projects'][1]['proposals']);
    }

    public function testEndButtonIsATertiaryLinkWhenSeveralProposals(): void
    {
        $digest = FollowerActivitiesDigest::build(['project1' => self::project(2)]);

        self::assertSame(
            ['label' => 'email.follower-activities.see-proposal', 'variant' => FollowerActivitiesDigest::BUTTON_TERTIARY],
            $digest['projects'][0]['proposals'][0]['endButton']
        );
    }

    public function testEndButtonIsPrimaryWhenSingleProposal(): void
    {
        $digest = FollowerActivitiesDigest::build(['project1' => self::project(1, ['votes' => 2])]);

        self::assertSame(FollowerActivitiesDigest::BUTTON_PRIMARY, $digest['projects'][0]['proposals'][0]['endButton']['variant']);
    }

    public function testOfficialResponseButtonIsPrimaryWhenItIsTheOnlyNewsOfTheProposal(): void
    {
        $digest = FollowerActivitiesDigest::build([
            'project1' => self::project(2, ['votes' => 0, 'officialResponses' => 1]),
        ]);

        self::assertSame(FollowerActivitiesDigest::BUTTON_PRIMARY, $digest['projects'][0]['proposals'][0]['officialResponseButton']);
    }

    public function testOfficialResponseButtonStaysSecondaryWithOtherNewsInASingleProposalEmail(): void
    {
        $digest = FollowerActivitiesDigest::build([
            'project1' => self::project(1, ['votes' => 2, 'officialResponses' => 1]),
        ]);

        self::assertSame(FollowerActivitiesDigest::BUTTON_SECONDARY, $digest['projects'][0]['proposals'][0]['officialResponseButton']);
    }

    public function testOfficialResponseButtonReplacesEndButton(): void
    {
        $digest = FollowerActivitiesDigest::build(['project1' => self::project(2, ['votes' => 1, 'officialResponses' => 1])]);
        $proposal = $digest['projects'][0]['proposals'][0];

        self::assertTrue($proposal['hasOfficialResponse']);
        self::assertSame(FollowerActivitiesDigest::BUTTON_SECONDARY, $proposal['officialResponseButton']);
        self::assertNull($proposal['endButton']);
    }

    public function testEndButtonInvitesToReadCommentsWhenOnlyComments(): void
    {
        $digest = FollowerActivitiesDigest::build(['project1' => self::project(1, ['votes' => 0, 'comments' => 2])]);

        self::assertSame(
            'email.follower-activities.read-comments',
            $digest['projects'][0]['proposals'][0]['endButton']['label']
        );
    }

    public function testKeepsThreePostsAndTruncatesTheirAbstract(): void
    {
        $post = [
            'title' => 'Post',
            'abstract' => str_repeat('mot ', 40),
            'link' => 'https://capco.test/blog/post',
            'image' => null,
            'authorName' => 'Author',
            'isPublishedByProposalAuthor' => true,
        ];
        $digest = FollowerActivitiesDigest::build([
            'project1' => self::project(1, ['posts' => array_fill(0, 5, $post)]),
        ]);
        $proposal = $digest['projects'][0]['proposals'][0];

        self::assertCount(3, $proposal['posts']);
        self::assertSame(5, $proposal['postCount']);
        self::assertSame(2, $proposal['hiddenPostCount']);
        self::assertLessThanOrEqual(FollowerActivitiesDigest::POST_ABSTRACT_MAX_LENGTH + 1, mb_strlen((string) $proposal['posts'][0]['abstract']));
        self::assertStringEndsWith('mot…', $proposal['posts'][0]['abstract']);
    }

    public function testStepTagUsesTheStatusColorAndIsHiddenWithoutStatus(): void
    {
        $digest = FollowerActivitiesDigest::build([
            'project1' => [
                'projectTitle' => 'Project',
                'proposals' => [
                    'withStatus' => self::proposal(['lastStep' => ['titleStep' => 'Vote', 'sName' => 'Retenue', 'sColor' => StatusColor::SUCCESS]]),
                    'unknownColor' => self::proposal(['lastStep' => ['titleStep' => 'Vote', 'sName' => 'Status', 'sColor' => 'unknown']]),
                    'withoutStatus' => self::proposal(['lastStep' => ['titleStep' => 'Vote', 'sName' => null, 'sColor' => null]]),
                ],
            ],
        ]);
        [$withStatus, $unknownColor, $withoutStatus] = $digest['projects'][0]['proposals'];

        self::assertSame(['label' => 'Retenue', 'variant' => StatusColor::SUCCESS], $withStatus['step']['tag']);
        self::assertSame(StatusColor::NORMAL, $unknownColor['step']['tag']['variant']);
        self::assertNull($withoutStatus['step']['tag']);
    }

    public function testPrimaryTagIsDerivedFromThePlatformColor(): void
    {
        $digest = FollowerActivitiesDigest::build([], '#E60000', '#FFFFFF');

        self::assertSame('#E60000', $digest['colors']['primary']);
        self::assertSame('#FBD9D9', $digest['tagColors'][StatusColor::PRIMARY]['background']);
        self::assertSame('#730000', $digest['tagColors'][StatusColor::PRIMARY]['color']);
    }

    public function testFallsBackToDefaultColorsWhenPlatformColorIsInvalid(): void
    {
        $digest = FollowerActivitiesDigest::build([], 'rgb(0, 0, 0)', null);

        self::assertSame(FollowerActivitiesDigest::DEFAULT_PRIMARY_COLOR, $digest['colors']['primary']);
        self::assertSame(FollowerActivitiesDigest::DEFAULT_PRIMARY_TEXT_COLOR, $digest['colors']['primaryText']);
    }

    /**
     * @param array<string, mixed> $activities
     *
     * @return array<string, mixed>
     */
    private static function project(int $proposalCount, array $activities = ['votes' => 1]): array
    {
        $proposals = [];
        for ($index = 0; $index < $proposalCount; ++$index) {
            $proposals["proposal{$index}"] = self::proposal($activities);
        }

        return ['projectTitle' => 'Project', 'proposals' => $proposals];
    }

    /**
     * @param array<string, mixed> $activities
     *
     * @return array<string, mixed>
     */
    private static function proposal(array $activities): array
    {
        return $activities + [
            'title' => 'Proposal',
            'link' => 'https://capco.test/proposal',
            'votes' => 0,
            'comments' => 0,
            'lastStep' => false,
            'officialResponses' => 0,
            'posts' => false,
        ];
    }
}
