<?php
namespace Application\Migrations;

use Doctrine\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20150617171549 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE site_color ADD category LONGTEXT NOT NULL');
        $this->addSql('ALTER TABLE site_image ADD category LONGTEXT NOT NULL');
        $this->addSql('ALTER TABLE site_parameter ADD category LONGTEXT NOT NULL');
    }

    public function postUp(Schema $schema): void
    {
        $parameterCategories = [
            'pages.homepage' => [
                'homepage.jumbotron.title',
                'homepage.jumbotron.body',
                'homepage.jumbotron.button',
                'homepage.jumbotron.button_link',
                'homepage.jumbotron.darken',
            ],
            'pages.footer' => ['footer.text.title', 'footer.text.body'],
            'pages.consultations' => [
                'consultations.jumbotron.title',
                'consultations.jumbotron.body',
                'consultations.content.body',
                'consultations.pagination',
                'contributors.pagination',
            ],
            'pages.ideas' => [
                'ideas.jumbotron.title',
                'ideas.jumbotron.body',
                'ideas.content.body',
                'ideas.trashed.jumbotron.title',
                'ideas.trashed.content.body',
                'ideas.pagination',
            ],
            'pages.themes' => [
                'themes.jumbotron.title',
                'themes.jumbotron.body',
                'themes.content.body',
                'themes.pagination',
            ],
            'pages.blog' => ['blog.pagination.size', 'blog.jumbotron.body', 'blog.jumbotron.title'],
            'pages.events' => [
                'events.jumbotron.title',
                'events.jumbotron.body',
                'events.content.body',
            ],
            'pages.contact' => [
                'contact.jumbotron.body',
                'contact.content.body',
                'contact.content.address',
                'contact.content.phone_number',
                'admin.mail.contact',
            ],
            'pages.registration' => [
                'signin.cgu.name',
                'signin.cgu.link',
                'signin.text.top',
                'signin.text.bottom',
            ],
            'pages.login' => ['login.text.top', 'login.text.bottom'],
            'pages.members' => [
                'members.pagination.size',
                'members.jumbotron.body',
                'members.jumbotron.title',
                'members.content.body',
            ],
            'settings.global' => [
                'admin.mail.notifications',
                'global.site.fullname',
                'global.site.embed_js',
            ],
        ];

        foreach ($parameterCategories as $category => $keynames) {
            foreach ($keynames as $key) {
                $this->connection->update(
                    'site_parameter',
                    ['category' => $category],
                    ['keyname' => $key]
                );
            }
        }

        $imagesCategories = [
            'pages.homepage' => ['image.header', 'image.picto'],
            'settings.global' => ['image.logo', 'image.default_avatar'],
        ];

        foreach ($imagesCategories as $category => $keynames) {
            foreach ($keynames as $key) {
                $this->connection->update(
                    'site_image',
                    ['category' => $category],
                    ['keyname' => $key]
                );
            }
        }

        $colorsCategories = [
            'pages.footer' => [
                'color.footer.text',
                'color.footer.bg',
                'color.footer2.text',
                'color.footer2.bg',
                'color.footer.title',
            ],
            'settings.global' => [
                'color.body.bg',
                'color.body.text',
                'color.header.bg',
                'color.header.title',
                'color.header.text',
                'color.h1',
                'color.h2',
                'color.h3',
                'color.h4',
                'color.h5',
                'color.h6',
                'color.btn.primary',
                'color.btn.primary.text',
                'color.link',
                'color.link.hover',
                'color.section.bg',
                'color.section.text',
                'color.main_menu.text',
                'color.main_menu.text_active',
                'color.main_menu.text_hover',
                'color.main_menu.bg',
                'color.main_menu.bg_active',
            ],
            'pages.homepage' => [
                'color.header2.bg',
                'color.header2.text',
                'color.header2.title',
                'color.btn',
                'color.btn.text',
            ],
        ];

        foreach ($colorsCategories as $category => $keynames) {
            foreach ($keynames as $key) {
                $this->connection->update(
                    'site_color',
                    ['category' => $category],
                    ['keyname' => $key]
                );
            }
        }
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            $this->connection->getDatabasePlatform()->getName() != 'mysql',
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('ALTER TABLE site_color DROP category');
        $this->addSql('ALTER TABLE site_image DROP category');
        $this->addSql('ALTER TABLE site_parameter DROP category');
    }
}
