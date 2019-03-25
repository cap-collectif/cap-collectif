<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\Id\UuidGenerator;
use Doctrine\Migrations\AbstractMigration;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20190320141742 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;
    private $generator;
    private $em;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE contact_form (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', email VARCHAR(255) NOT NULL, interlocutor VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, body LONGTEXT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE UTF8_unicode_ci ENGINE = InnoDB'
        );
    }

    public function postUp(Schema $schema): void
    {
        $contactBody = $this->connection->fetchColumn(
            'SELECT value FROM site_parameter WHERE keyname = :keyname',

            ['keyname' => 'contact.content.body']
        );

        $contactMail = $this->connection->fetchColumn(
            'SELECT value FROM site_parameter WHERE keyname = :keyname',
            ['keyname' => 'admin.mail.contact']
        );

        $date = (new \DateTime())->format('Y-m-d H:i:s');

        $contactTitle = $this->connection->fetchColumn(
            'SELECT value FROM site_parameter WHERE keyname = :keyname',
            ['keyname' => 'contact.title']
        );
        if (!$contactTitle) {
            $this->connection->insert('site_parameter', [
                'keyname' => 'contact.title',
                'value' => 'Contact',
                'created_at' => $date,
                'updated_at' => $date,
                'is_enabled' => true,
                'type' => SiteParameter::TYPE_SIMPLE_TEXT,
                'category' => 'pages.contact',
            ]);
        }

        if ($contactBody && $contactMail) {
            $uuid = $this->generator->generate($this->em, null);
            $this->connection->insert('contact_form', [
                'id' => $uuid,
                'title' => 'Contact',
                'body' => $contactBody,
                'email' => $contactMail,
            ]);
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE contact_form');
    }
}
