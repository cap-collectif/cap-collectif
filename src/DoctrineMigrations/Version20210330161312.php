<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20210330161312 extends AbstractMigration
{
    private const NEW_PROJECT_TYPES = [
        [
            'title' => 'voting',
            'slug' => 'voting',
            'color' => '#999999',
        ],
        [
            'title' => 'project.types.questionAnswer',
            'slug' => 'question-answer',
            'color' => '#999999',
        ],
        [
            'title' => 'project.types.participatoryFunding',
            'slug' => 'participatory-funding',
            'color' => '#5bc0de',
        ],
        [
            'title' => 'project.types.mutualHelp',
            'slug' => 'mutual-help',
            'color' => '#999999',
        ],
        [
            'title' => 'project.types.concertation',
            'slug' => 'concertation',
            'color' => '#999999',
        ],
        [
            'title' => 'project.types.inquiry',
            'slug' => 'inquiry',
            'color' => '#337ab7',
        ],
        [
            'title' => 'project.types.callForApplications',
            'slug' => 'call-for-applications',
            'color' => '#999999',
        ],
        [
            'title' => 'project.types.quizz',
            'slug' => 'quizz',
            'color' => '#999999',
        ],
        [
            'title' => 'project.types.testimony',
            'slug' => 'testimony',
            'color' => '#999999',
        ],
    ];

    public function getDescription(): string
    {
        return 'add several ProjectTypes';
    }

    public function up(Schema $schema): void
    {
        foreach (self::NEW_PROJECT_TYPES as $newProjectType) {
            $this->insertProjectType(
                $newProjectType['title'],
                $newProjectType['slug'],
                $newProjectType['color']
            );
        }
    }

    public function down(Schema $schema): void
    {
        foreach (self::NEW_PROJECT_TYPES as $newProjectType) {
            $this->removeProjectType($newProjectType['slug']);
        }
    }

    private function insertProjectType(string $title, string $slug, string $color): void
    {
        $data = [
            'title' => $title,
            'slug' => $slug,
            'color' => $color,
        ];
        $this->connection->insert('project_type', $data);
    }

    private function removeProjectType(string $slug): void
    {
        $this->connection->delete('project_type', ['slug' => $slug]);
    }
}
