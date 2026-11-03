<?php

namespace Capco\AppBundle\Mailer\Message\Follower;

use Capco\AppBundle\Enum\StatusColor;

/**
 * Builds the view model of the daily summary sent to followers from the raw user activities.
 */
final class FollowerActivitiesDigest
{
    public const MAX_PROPOSALS = 5;
    public const MAX_POSTS = 3;
    public const POST_ABSTRACT_MAX_LENGTH = 95;
    public const DEFAULT_PRIMARY_COLOR = '#006CE0';
    public const DEFAULT_PRIMARY_TEXT_COLOR = '#FFFFFF';

    public const BUTTON_PRIMARY = 'primary';
    public const BUTTON_SECONDARY = 'secondary';
    public const BUTTON_TERTIARY = 'tertiary';

    // Tag colors from the design system: [background, text, dark mode background, dark mode text].
    private const STATUS_TAG_COLORS = [
        StatusColor::SUCCESS => ['#E4F9E9', '#165A26', '#165A26', '#E4F9E9'],
        StatusColor::WARNING => ['#FFF3E0', '#704300', '#704300', '#FFF3E0'],
        StatusColor::CAUTION => ['#FFF7E0', '#705400', '#705400', '#FFF7E0'],
        StatusColor::INFO => ['#E0EFFF', '#003670', '#003670', '#E0EFFF'],
        StatusColor::DANGER => ['#FAE5E7', '#5F1119', '#5F1119', '#FAE5E7'],
        StatusColor::NORMAL => ['#E8EBED', '#545E68', '#545E68', '#E8EBED'],
    ];

    /**
     * @param array<string, array<string, mixed>> $userProjects
     *
     * @return array<string, mixed>
     */
    public static function build(
        array $userProjects,
        ?string $primaryColor = null,
        ?string $primaryTextColor = null
    ): array {
        $colors = self::getColors($primaryColor, $primaryTextColor);
        $proposalCount = array_sum(
            array_map(static fn (array $project): int => \count($project['proposals'] ?? []), $userProjects)
        );
        $isSingleProposal = 1 === $proposalCount;
        $displayedProposalCount = 0;
        $projects = [];

        foreach ($userProjects as $project) {
            $proposals = [];
            foreach ($project['proposals'] ?? [] as $proposal) {
                if ($displayedProposalCount >= self::MAX_PROPOSALS) {
                    break;
                }
                $proposals[] = self::buildProposal($proposal, $isSingleProposal);
                ++$displayedProposalCount;
            }
            $opinions = array_values($project['opinions'] ?? []);

            if ([] === $proposals && [] === $opinions) {
                continue;
            }

            $projects[] = [
                'title' => $project['projectTitle'] ?? '',
                'proposals' => $proposals,
                'opinions' => $opinions,
            ];
        }

        return [
            'projects' => $projects,
            'proposalCount' => $proposalCount,
            'hiddenProposalCount' => $proposalCount - $displayedProposalCount,
            'colors' => $colors,
            'tagColors' => self::getTagColors($colors),
        ];
    }

    /**
     * @param array<string, mixed> $proposal
     *
     * @return array<string, mixed>
     */
    private static function buildProposal(array $proposal, bool $isSingleProposal): array
    {
        $votes = (int) ($proposal['votes'] ?? 0);
        $comments = (int) ($proposal['comments'] ?? 0);
        $hasOfficialResponse = ($proposal['officialResponses'] ?? 0) > 0;
        $posts = array_values($proposal['posts'] ?: []);
        $step = $proposal['lastStep'] ?? false;
        $isOnlyComments = $comments > 0 && 0 === $votes && !$step && !$hasOfficialResponse && [] === $posts;
        $isOnlyOfficialResponse = $hasOfficialResponse && 0 === $votes && 0 === $comments && !$step && [] === $posts;

        return [
            'title' => $proposal['title'],
            'link' => $proposal['link'],
            'image' => $proposal['image'] ?? null,
            'category' => $proposal['category'] ?? null,
            'votes' => $votes,
            'comments' => $comments,
            'step' => $step
                ? [
                    'title' => $step['titleStep'],
                    'tag' => $step['sName']
                        ? [
                            'label' => $step['sName'],
                            'variant' => self::getStatusTagVariant($step['sColor'] ?? null),
                        ]
                        : null,
                ]
                : null,
            'hasOfficialResponse' => $hasOfficialResponse,
            // Primary when the official response is the only news of the proposal.
            'officialResponseButton' => $isOnlyOfficialResponse ? self::BUTTON_PRIMARY : self::BUTTON_SECONDARY,
            'posts' => array_map(
                static fn (array $post): array => ['abstract' => self::truncate($post['abstract'])] + $post,
                \array_slice($posts, 0, self::MAX_POSTS)
            ),
            'postCount' => \count($posts),
            'hiddenPostCount' => max(0, \count($posts) - self::MAX_POSTS),
            // The official response button replaces the end button.
            'endButton' => $hasOfficialResponse
                ? null
                : [
                    'label' => $isOnlyComments
                        ? 'email.follower-activities.read-comments'
                        : 'email.follower-activities.see-proposal',
                    'variant' => $isSingleProposal ? self::BUTTON_PRIMARY : self::BUTTON_TERTIARY,
                ],
        ];
    }

    private static function getStatusTagVariant(?string $statusColor): string
    {
        return StatusColor::PRIMARY === $statusColor || isset(self::STATUS_TAG_COLORS[$statusColor])
            ? (string) $statusColor
            : StatusColor::NORMAL;
    }

    /**
     * @param array<string, string> $colors
     *
     * @return array<string, array{background: string, color: string, darkBackground: string, darkColor: string}>
     */
    private static function getTagColors(array $colors): array
    {
        $tagColors = [];
        foreach (self::STATUS_TAG_COLORS as $variant => [$background, $color, $darkBackground, $darkColor]) {
            $tagColors[$variant] = [
                'background' => $background,
                'color' => $color,
                'darkBackground' => $darkBackground,
                'darkColor' => $darkColor,
            ];
        }
        $tagColors[StatusColor::PRIMARY] = [
            'background' => self::mix($colors['primary'], '#FFFFFF', 0.85),
            'color' => self::mix($colors['primary'], '#000000', 0.5),
            'darkBackground' => self::mix($colors['primary'], '#000000', 0.5),
            'darkColor' => self::mix($colors['primary'], '#FFFFFF', 0.85),
        ];

        return $tagColors;
    }

    /**
     * @return array<string, string>
     */
    private static function getColors(?string $primaryColor, ?string $primaryTextColor): array
    {
        $primary = self::isHexColor($primaryColor) ? $primaryColor : self::DEFAULT_PRIMARY_COLOR;

        return [
            'primary' => $primary,
            'primaryText' => self::isHexColor($primaryTextColor) ? $primaryTextColor : self::DEFAULT_PRIMARY_TEXT_COLOR,
            // Lighter primary keeps links and buttons readable on dark backgrounds.
            'primaryDark' => self::mix($primary, '#FFFFFF', 0.6),
        ];
    }

    private static function isHexColor(?string $color): bool
    {
        return null !== $color && 1 === preg_match('/^#[0-9a-fA-F]{6}$/', $color);
    }

    /**
     * Mixes $color with $target, $ratio being the share of $target.
     */
    private static function mix(string $color, string $target, float $ratio): string
    {
        $channels = array_map(
            static fn (int $offset): int => (int) round(
                hexdec(substr($color, $offset, 2)) * (1 - $ratio) + hexdec(substr($target, $offset, 2)) * $ratio
            ),
            [1, 3, 5]
        );

        return vsprintf('#%02X%02X%02X', $channels);
    }

    private static function truncate(string $text): string
    {
        $text = trim((string) preg_replace('/\s+/u', ' ', html_entity_decode($text, \ENT_QUOTES | \ENT_HTML5)));
        if (mb_strlen($text) <= self::POST_ABSTRACT_MAX_LENGTH) {
            return $text;
        }
        $truncated = mb_substr($text, 0, self::POST_ABSTRACT_MAX_LENGTH);
        $lastSpace = mb_strrpos($truncated, ' ');

        return rtrim(false !== $lastSpace ? mb_substr($truncated, 0, $lastSpace) : $truncated, ' ,;:.') . '…';
    }
}
