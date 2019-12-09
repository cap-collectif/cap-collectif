<?php

namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150710111651 extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE site_color DROP title');
        $this->addSql('ALTER TABLE site_image DROP title');
        $this->addSql('ALTER TABLE site_parameter DROP title');
    }

    public function postUp(Schema $schema): void
    {
        // Change some keynames that cause troubles
        $this->connection->update(
            'site_color',
            ['keyname' => 'color.btn.bg'],
            ['keyname' => 'color.btn']
        );
        $this->connection->update(
            'site_color',
            ['keyname' => 'color.btn.primary.bg'],
            ['keyname' => 'color.btn.primary']
        );
        $this->connection->update(
            'site_color',
            ['keyname' => 'color.link.default'],
            ['keyname' => 'color.link']
        );

        // Set new categories

        $parametersCategories = [
            'admin.mail.notifications' => 'settings.notifications',
            'ideas.trashed.content.body' => 'pages.ideas_trash',
            'ideas.trashed.jumbotron.title' => 'pages.ideas_trash'
        ];

        $colorsCategories = [
            'color.body.bg' => 'settings.appearance',
            'color.body.text' => 'settings.appearance',
            'color.header.bg' => 'settings.appearance',
            'color.header.title' => 'settings.appearance',
            'color.header.text' => 'settings.appearance',
            'color.h1' => 'settings.appearance',
            'color.h2' => 'settings.appearance',
            'color.h3' => 'settings.appearance',
            'color.h4' => 'settings.appearance',
            'color.h5' => 'settings.appearance',
            'color.h6' => 'settings.appearance',
            'color.btn.primary.bg' => 'settings.appearance',
            'color.btn.primary.text' => 'settings.appearance',
            'color.link.default' => 'settings.appearance',
            'color.link.hover' => 'settings.appearance',
            'color.section.bg' => 'settings.appearance',
            'color.section.text' => 'settings.appearance',
            'color.main_menu.text' => 'settings.appearance',
            'color.main_menu.text_active' => 'settings.appearance',
            'color.main_menu.text_hover' => 'settings.appearance',
            'color.main_menu.bg' => 'settings.appearance',
            'color.main_menu.bg_active' => 'settings.appearance'
        ];

        $imagesCategories = [
            'image.logo' => 'settings.appearance',
            'image.default_avatar' => 'settings.appearance'
        ];

        foreach ($parametersCategories as $key => $category) {
            $this->connection->update(
                'site_parameter',
                ['category' => $category],
                ['keyname' => $key]
            );
        }

        foreach ($colorsCategories as $key => $category) {
            $this->connection->update('site_color', ['category' => $category], ['keyname' => $key]);
        }

        foreach ($imagesCategories as $key => $category) {
            $this->connection->update('site_image', ['category' => $category], ['keyname' => $key]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' != $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'ALTER TABLE site_color ADD title VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql(
            'ALTER TABLE site_image ADD title VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci'
        );
        $this->addSql(
            'ALTER TABLE site_parameter ADD title VARCHAR(255) NOT NULL COLLATE utf8_unicode_ci'
        );
    }
}
