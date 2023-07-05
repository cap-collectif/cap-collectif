<?php

declare(strict_types=1);

namespace Application\Migrations;

use Capco\AppBundle\Entity\SiteParameter;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\ORM\Id\UuidGenerator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20191219095408 extends AbstractMigration implements ContainerAwareInterface
{
    protected $container;
    private $generator;
    private $em;

    public function setContainer(?ContainerInterface $container = null)
    {
        $this->container = $container;
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
            'CREATE TABLE site_parameter_translation (id CHAR(36) NOT NULL COMMENT \'(DC2Type:guid)\', translatable_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:guid)\', value LONGTEXT NOT NULL, locale VARCHAR(255) NOT NULL, INDEX IDX_58D8A9E72C2AC5D3 (translatable_id), UNIQUE INDEX site_parameter_translation_unique_translation (translatable_id, locale), PRIMARY KEY(id)) DEFAULT CHARACTER SET UTF8 COLLATE `UTF8_unicode_ci` ENGINE = InnoDB'
        );
        $this->addSql(
            'ALTER TABLE site_parameter_translation ADD CONSTRAINT FK_58D8A9E72C2AC5D3 FOREIGN KEY (translatable_id) REFERENCES site_parameter (id) ON DELETE CASCADE'
        );
        $this->addSql('ALTER TABLE site_parameter CHANGE value value LONGTEXT DEFAULT NULL');
    }

    public function postUp(Schema $schema): void
    {
        $locale = $this->connection->fetchAssoc(
            'SELECT * FROM site_parameter WHERE keyname = "global.locale"'
        )['value'];

        $parameters = $this->connection->fetchAllAssociative('SELECT * FROM site_parameter');
        foreach ($parameters as $parameter) {
            if (!\in_array($parameter['keyname'], SiteParameter::NOT_TRANSLATABLE)) {
                if (!empty($parameter['value'])) {
                    $this->connection->insert('site_parameter_translation', [
                        'id' => $this->generator->generate($this->em, null),
                        'locale' => $locale,
                        'translatable_id' => $parameter['id'],
                        'value' => $parameter['value'],
                    ]);
                }
            }
        }

        // Once all site_parameter_translation rows have been created, we can remove previous values
        foreach ($parameters as $parameter) {
            if (!\in_array($parameter['keyname'], SiteParameter::NOT_TRANSLATABLE)) {
                $this->connection->update(
                    'site_parameter',
                    [
                        'value' => null,
                    ],
                    [
                        'id' => $parameter['id'],
                    ]
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
    }
}
