<?php

declare(strict_types=1);

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200120121351 extends AbstractMigration implements ContainerAwareInterface
{
    public const DEFAULT_FONTS = [
        [
            'name' => 'Helvetica Neue',
            'family_name' => 'Helvetica Neue, Helvetica, Arial, sans-serif',
            'is_custom' => 0,
            'use_as_heading' => 1,
            'use_as_body' => 1,
        ],
        [
            'name' => 'Helvetica',
            'family_name' => 'Helvetica, Arial, sans-serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Arial',
            'family_name' => 'Arial, Helvetica, sans-serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Tahoma',
            'family_name' => 'Tahoma, sans-serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Geneva',
            'family_name' => 'Geneva, sans-serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Trebuchet MS',
            'family_name' => '"Trebuchet MS", Helvetica, sans-serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Verdana',
            'family_name' => 'Verdana, Geneva, sans-serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Georgia',
            'family_name' => 'Georgia, serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Palatino Linotype',
            'family_name' => '"Palatino Linotype", serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Book Antiqua',
            'family_name' => '"Book Antiqua", serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Palatino',
            'family_name' => 'Palatino, serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Times New Roman',
            'family_name' => '"Times New Roman", serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Times',
            'family_name' => 'Times, serif',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Courier New',
            'family_name' => '"Courier New", monospace',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
        [
            'name' => 'Courier',
            'family_name' => 'Courier, monospace',
            'is_custom' => 0,
            'use_as_heading' => 0,
            'use_as_body' => 0,
        ],
    ];
    private $generator;
    private $em;

    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql(
            'CREATE TABLE font (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', file_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', weight INT DEFAULT NULL, is_custom TINYINT(1) DEFAULT \'1\' NOT NULL, format VARCHAR(255) DEFAULT NULL, use_as_heading TINYINT(1) NOT NULL, use_as_body TINYINT(1) NOT NULL, name VARCHAR(255) NOT NULL, family_name VARCHAR(255) NOT NULL, style VARCHAR(255) DEFAULT NULL, fullname VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_D09408D293CB796C (file_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE font ADD CONSTRAINT FK_D09408D293CB796C FOREIGN KEY (file_id) REFERENCES media__media (id)'
        );
    }

    public function postUp(Schema $schema): void
    {
        foreach (self::DEFAULT_FONTS as $font) {
            $this->connection->insert(
                'font',
                array_merge(
                    [
                        'id' => $this->generator->generate($this->em, null),
                        'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
                    ],
                    $font
                )
            );
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf(
            'mysql' !== $this->connection->getDatabasePlatform()->getName(),
            'Migration can only be executed safely on \'mysql\'.'
        );

        $this->addSql('DROP TABLE font');
    }

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->em = $container->get('doctrine')->getManager();
        $this->generator = new UuidGenerator();
    }
}
