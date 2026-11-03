<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Enum\StatusColor;
use Capco\AppBundle\Model\UserActivity;
use Capco\AppBundle\Notifier\FollowerNotifier;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Renders the real follower summary template for each designed use case with an in-memory
 * mail transport; set UPDATE_EMAIL_SNAPSHOTS=1 to regenerate the snapshots.
 */
class FollowerActivitiesEmailTest extends MailerSnapshotCommandTestCase
{
    private const SNAPSHOT_DIRECTORY = 'follower_activities/';
    private const IMAGE = 'https://capco.test/media/default/0001/01/proposal.jpg';
    private const POST_IMAGE = 'https://capco.test/media/default/0001/01/post.jpg';

    /**
     * @dataProvider useCases
     *
     * @param array<string, array<string, mixed>> $userProjects
     * @param list<string>                        $expectedFragments
     */
    public function testSummaryMatchesSnapshot(
        array $userProjects,
        string $snapshot,
        array $expectedFragments = []
    ): void {
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(FollowerNotifier::class);
        self::assertInstanceOf(FollowerNotifier::class, $notifier);
        $notifier->setSendAt('2017-10-02');

        $notifier->onReportActivities($this->userActivity($userProjects));

        self::assertCount(1, $emails->messages);
        $message = $emails->messages[0];
        foreach ($expectedFragments as $fragment) {
            self::assertStringContainsString($fragment, (string) $message->getHtmlBody());
        }

        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            $this->updateEmailSnapshot($message, self::SNAPSHOT_DIRECTORY . $snapshot);
        }

        $this->assertEmailMatchesSnapshot($message, self::SNAPSHOT_DIRECTORY . $snapshot);
    }

    /**
     * @return iterable<string, array{0: array<string, array<string, mixed>>, 1: string, 2?: list<string>}>
     */
    public static function useCases(): iterable
    {
        yield 'two projects with several proposals' => [
            [
                'project1' => self::project('Vos solutions pour la vie étudiante', [
                    self::proposal('EcoCorpo', [
                        'votes' => 8,
                        'comments' => 3,
                        'posts' => [self::post('Eco Corpo s’agrandit !', true)],
                    ]),
                    self::proposal('Une recyclerie de vélos sur le campus', [
                        'votes' => 5,
                        'posts' => [self::post('Premier atelier de réparation ce jeudi', true)],
                    ]),
                    self::proposal('Une bibliothèque d’objets partagés', [
                        'votes' => 12,
                        'comments' => 4,
                        'lastStep' => self::step('Vote', 'Retenue', StatusColor::SUCCESS),
                    ]),
                ]),
                'project2' => self::project('Budget participatif des lycées', [
                    self::proposal('Un jardin partagé au lycée', [
                        'lastStep' => self::step('Réalisation', 'En cours', StatusColor::WARNING),
                        'officialResponses' => 1,
                        'posts' => [self::post('Les premiers bacs de culture sont installés', false)],
                    ]),
                ]),
            ],
            'two_projects.html',
            ['email.follower-activities.see-proposal', 'email.follower-activities.read-response'],
        ];

        yield 'only news' => [
            ['project1' => self::project('Projet', [self::proposal('Proposition', ['posts' => [self::post('Actualité', true)]])])],
            'only_news.html',
        ];

        yield 'only official response' => [
            ['project1' => self::project('Projet', [self::proposal('Proposition', ['officialResponses' => 1])])],
            'only_official_response.html',
        ];

        yield 'only step change' => [
            ['project1' => self::project('Projet', [
                self::proposal('Proposition', ['lastStep' => self::step('Vote', 'Retenue', StatusColor::SUCCESS)]),
            ])],
            'only_step.html',
        ];

        yield 'only votes' => [
            ['project1' => self::project('Projet', [self::proposal('Proposition', ['votes' => 1])])],
            'only_votes.html',
        ];

        yield 'only comments' => [
            ['project1' => self::project('Projet', [self::proposal('Proposition', ['comments' => 2])])],
            'only_comments.html',
            ['email.follower-activities.read-comments'],
        ];

        yield 'all activities' => [
            ['project1' => self::project('Projet', [
                self::proposal('Proposition', [
                    'votes' => 2,
                    'comments' => 1,
                    'lastStep' => self::step('Vote', 'Retenue', StatusColor::SUCCESS),
                    'officialResponses' => 1,
                    'posts' => [self::post('Actualité du porteur', true), self::post('Actualité de l’administrateur', false)],
                ]),
            ])],
            'all_activities.html',
        ];

        yield 'more than three news' => [
            ['project1' => self::project('Projet', [
                self::proposal('Proposition', [
                    'posts' => array_map(
                        static fn (int $index): array => self::post("Actualité {$index}", true),
                        range(1, 5)
                    ),
                ]),
            ])],
            'more_than_three_news.html',
            ['email.follower-activities.see-other-news {&quot;num&quot;:2}'],
        ];

        yield 'news without image' => [
            ['project1' => self::project('Projet', [
                self::proposal('Proposition', ['posts' => [self::post('Distribution décalée à jeudi', true, null)]]),
            ])],
            'news_without_image.html',
            ['news-placeholder.png'],
        ];

        yield 'proposals without image' => [
            ['project1' => self::project('Projet', [
                self::proposal('Avec catégorie', [
                    'votes' => 1,
                    'image' => null,
                    'category' => ['color' => '#317E5B', 'icon' => 'recycle'],
                ]),
                self::proposal('Sans catégorie', ['votes' => 1, 'image' => null]),
            ])],
            'proposals_without_image.html',
            ['category/recycle.png'],
        ];

        yield 'step statuses' => [
            ['project1' => self::project('Projet', array_map(
                static fn (?string $color): array => self::proposal(
                    "Statut {$color}",
                    ['lastStep' => self::step('Vote', null === $color ? null : "Statut {$color}", $color)]
                ),
                [StatusColor::SUCCESS, StatusColor::WARNING, StatusColor::INFO, StatusColor::DANGER, StatusColor::NORMAL]
            ))],
            'step_statuses.html',
            ['tag tag-success', 'tag tag-warning', 'tag tag-info', 'tag tag-danger', 'tag tag-default'],
        ];

        yield 'step with primary status and without status' => [
            ['project1' => self::project('Projet', [
                self::proposal('Statut primaire', ['lastStep' => self::step('Vote', 'Primaire', StatusColor::PRIMARY)]),
                self::proposal('Sans statut', ['lastStep' => self::step('Vote', null, null)]),
            ])],
            'step_primary_and_without_status.html',
            ['tag tag-primary'],
        ];

        yield 'more than five proposals' => [
            [
                'project1' => self::project('Projet 1', array_map(
                    static fn (int $index): array => self::proposal("Proposition {$index}", ['votes' => 1]),
                    range(1, 4)
                )),
                'project2' => self::project('Projet 2', array_map(
                    static fn (int $index): array => self::proposal("Proposition {$index}", ['votes' => 1]),
                    range(5, 8)
                )),
            ],
            'more_than_five_proposals.html',
            ['email.follower-activities.other-proposals {&quot;num&quot;:3}'],
        ];
    }

    /**
     * @param array<string, array<string, mixed>> $userProjects
     */
    private function userActivity(array $userProjects): UserActivity
    {
        return (new UserActivity())
            ->setId('user5')
            ->setUsername('Camille')
            ->setEmail('camille@test.com')
            ->setLocale('fr-FR')
            ->setUrlManagingFollowings('https://capco.test/profile/followings/token')
            ->setUserProjects($userProjects)
        ;
    }

    /**
     * @param list<array<string, mixed>> $proposals
     *
     * @return array<string, mixed>
     */
    private static function project(string $title, array $proposals): array
    {
        $indexedProposals = [];
        foreach ($proposals as $index => $proposal) {
            $indexedProposals["proposal{$index}"] = $proposal;
        }

        return ['projectTitle' => $title, 'proposals' => $indexedProposals];
    }

    /**
     * @param array<string, mixed> $activities
     *
     * @return array<string, mixed>
     */
    private static function proposal(string $title, array $activities): array
    {
        return $activities + [
            'title' => $title,
            'link' => 'https://capco.test/project/projet/collect/collecte/proposals/' . md5($title),
            'image' => self::IMAGE,
            'category' => null,
            'votes' => 0,
            'comments' => 0,
            'lastStep' => false,
            'officialResponses' => 0,
            'posts' => false,
        ];
    }

    /**
     * @return array{titleStep: string, sName: ?string, sColor: ?string}
     */
    private static function step(string $title, ?string $statusName, ?string $statusColor): array
    {
        return ['titleStep' => $title, 'sName' => $statusName, 'sColor' => $statusColor];
    }

    /**
     * @return array<string, mixed>
     */
    private static function post(string $title, bool $isPublishedByProposalAuthor, ?string $image = self::POST_IMAGE): array
    {
        return [
            'title' => $title,
            'abstract' => 'Après le succès de la première distribution, Eco Corpo passe à cinquante paniers par semaine dès la rentrée.',
            'link' => 'https://capco.test/blog/' . md5($title),
            'image' => $image,
            'authorName' => $isPublishedByProposalAuthor ? 'AEST' : 'La Région Citoyenne',
            'isPublishedByProposalAuthor' => $isPublishedByProposalAuthor,
        ];
    }
}
